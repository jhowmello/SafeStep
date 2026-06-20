'use strict';

/**
 * Backend do SafeStep.
 *
 * Mantem o json-server (db.json) para as rotas existentes (epis, ordensServico,
 * checklists, checklistItens, logs) e adiciona uma camada propria de
 * autenticacao/cadastro com criterios de seguranca baseados no OWASP Top 10
 * (2021) e no OWASP ASVS / Authentication & Password Storage Cheat Sheets.
 *
 * Resumo das mitigacoes implementadas (ver RELATORIO-SEGURANCA.md):
 * - A02 (Cryptographic Failures): senhas nunca sao armazenadas ou retornadas
 *   em texto puro. Hash com scrypt (modulo nativo crypto) com salt aleatorio
 *   por usuario. Campo senha jamais existe apos a migracao inicial.
 * - A03 (Injection): validacao e sanitizacao de todos os campos de entrada
 *   em /auth/register (lib/sanitize.js).
 * - A04 (Insecure Design): cadastro e login passam a ser decididos no
 *   servidor (nao mais o cliente buscando a lista inteira de usuarios e
 *   comparando senha localmente).
 * - A05 (Security Misconfiguration): headers de seguranca, limite de tamanho
 *   de payload, remocao do header X-Powered-By.
 * - A07 (Identification and Authentication Failures): politica de senha
 *   (lib/passwordPolicy.js), rate limiting em /auth/register e /auth/login
 *   (lib/rateLimit.js), mensagens de erro genericas para nao revelar se um
 *   e-mail existe, comparacao de hash em tempo constante.
 * - A09 (Security Logging and Monitoring Failures): tentativas de
 *   cadastro/login (sem dados sensiveis) sao gravadas em /logs.
 */

const path = require('path');
const express = require('express');
const jsonServer = require('json-server');

const { hashPassword, verifyPassword, isHashed } = require('./lib/passwordHash');
const { validarSenha } = require('./lib/passwordPolicy');
const { validarCadastro } = require('./lib/sanitize');
const { createRateLimiter, clientIp } = require('./lib/rateLimit');

const DB_PATH = path.join(__dirname, 'db.json');
const PORT = Number(process.env.PORT) || 3000;
// --network (ou HOST=0.0.0.0) expoe o servidor para a rede local - use com
// cautela, apenas em redes confiaveis (ver RELATORIO-SEGURANCA.md, A05).
const HOST = process.env.HOST || (process.argv.includes('--network') ? '0.0.0.0' : 'localhost');

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);
const db = router.db; // instancia lowdb compartilhada com o router

// ---------------------------------------------------------------------------
// Migracao: converte qualquer senha em texto puro remanescente em db.json
// para hash seguro antes do servidor aceitar requisicoes. Idempotente.
// ---------------------------------------------------------------------------
async function migrarSenhasEmTextoPuro() {
  const tecnicos = db.get('tecnicos').value() || [];
  let alterado = false;

  for (const tecnico of tecnicos) {
    if (tecnico.senha && !isHashed(tecnico.senha)) {
      tecnico.senhaHash = await hashPassword(tecnico.senha);
      delete tecnico.senha;
      alterado = true;
      console.log('[migracao] Senha em texto puro do tecnico id=' + tecnico.id + ' convertida para hash seguro.');
    } else if (tecnico.senha && isHashed(tecnico.senha)) {
      tecnico.senhaHash = tecnico.senha;
      delete tecnico.senha;
      alterado = true;
    }
  }

  if (alterado) {
    db.write();
    console.log('[migracao] db.json atualizado: nenhuma senha em texto puro permanece.');
  }
}

// ---------------------------------------------------------------------------
// Headers de seguranca (equivalente manual ao helmet, sem dependencia externa)
// ---------------------------------------------------------------------------
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
}

// ---------------------------------------------------------------------------
// Remove campos sensiveis (senha / senhaHash) de qualquer resposta JSON.
// Aplicado nas rotas /tecnicos servidas pelo router generico do json-server,
// que nao deve mais aceitar escrita direta (ver bloqueio abaixo).
// ---------------------------------------------------------------------------
function removerCamposSensiveis(valor) {
  if (Array.isArray(valor)) return valor.map(removerCamposSensiveis);
  if (valor && typeof valor === 'object') {
    const copia = Object.assign({}, valor);
    delete copia.senha;
    delete copia.senhaHash;
    return copia;
  }
  return valor;
}

function interceptarRespostaTecnicos(req, res, next) {
  const originalJson = res.json.bind(res);
  const originalJsonp = res.jsonp.bind(res);
  res.json = function (body) { return originalJson(removerCamposSensiveis(body)); };
  res.jsonp = function (body) { return originalJsonp(removerCamposSensiveis(body)); };
  next();
}

// Bloqueia escrita direta em /tecnicos via o router generico do json-server.
// Todo cadastro deve passar por /auth/register, que aplica hashing e
// validacao. Leitura (GET) permanece liberada, mas sem campos sensiveis.
function bloquearEscritaDiretaTecnicos(req, res, next) {
  const metodosBloqueados = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (metodosBloqueados.includes(req.method)) {
    return res.status(405).json({
      erro: 'Operacao nao permitida. Use /auth/register para criar contas.',
    });
  }
  next();
}

function registrarLog(acao, detalhes) {
  try {
    db.get('logs')
      .insert(Object.assign({ acao }, detalhes, { timestamp: new Date().toISOString() }))
      .write();
  } catch (err) {
    console.error('[log] Falha ao registrar evento de auditoria:', err.message);
  }
}

function dadosPublicosTecnico(tecnico) {
  return {
    id: tecnico.id,
    nome: tecnico.nome,
    matricula: tecnico.matricula,
    email: tecnico.email,
    cargo: tecnico.cargo,
  };
}

// ---------------------------------------------------------------------------
// Rate limiting nos endpoints sensiveis de autenticacao
// ---------------------------------------------------------------------------
const limitarCadastroPorIp = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyFn: function (req) { return 'register:' + clientIp(req); },
  message: 'Muitas tentativas de cadastro. Tente novamente em alguns minutos.',
});

const limitarLoginPorIp = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyFn: function (req) { return 'login-ip:' + clientIp(req); },
  message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
});

const limitarLoginPorConta = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyFn: function (req) { return 'login-acc:' + String(req.body && req.body.email).toLowerCase(); },
  message: 'Muitas tentativas de login para esta conta. Tente novamente em alguns minutos.',
});

// ---------------------------------------------------------------------------
// Montagem do app
// ---------------------------------------------------------------------------
server.disable('x-powered-by');
server.set('trust proxy', false);
server.use(securityHeaders);
server.use(jsonServer.defaults({ logger: true }));

// Body parser dedicado as rotas /auth, com limite de tamanho (mitigacao de
// payload excessivo / DoS - OWASP A05).
server.use('/auth', express.json({ limit: '15kb' }));

// POST /auth/register
server.post('/auth/register', limitarCadastroPorIp, async (req, res) => {
  const ip = clientIp(req);
  try {
    const validacao = validarCadastro(req.body || {});
    const errosCampos = validacao.erros;
    const dados = validacao.dados;
    if (errosCampos.length > 0) {
      registrarLog('cadastro_rejeitado', { motivo: 'validacao_campos', ip: ip });
      return res.status(400).json({ erros: errosCampos });
    }

    const nome = dados.nome;
    const matricula = dados.matricula;
    const email = dados.email;
    const cargo = dados.cargo;
    const senha = dados.senha;
    const confirmarSenha = req.body && req.body.confirmarSenha;
    if (typeof confirmarSenha === 'string' && confirmarSenha !== senha) {
      return res.status(400).json({ erros: ['As senhas nao coincidem.'] });
    }

    const resultadoSenha = validarSenha(senha, { email: email, nome: nome, matricula: matricula });
    if (!resultadoSenha.valido) {
      registrarLog('cadastro_rejeitado', { motivo: 'politica_senha', ip: ip });
      return res.status(400).json({ erros: resultadoSenha.erros });
    }

    const tecnicos = db.get('tecnicos').value() || [];
    const emailDuplicado = tecnicos.some((t) => (t.email || '').toLowerCase() === email);
    const matriculaDuplicada = tecnicos.some((t) => (t.matricula || '').toUpperCase() === matricula);

    if (emailDuplicado || matriculaDuplicada) {
      registrarLog('cadastro_rejeitado', { motivo: 'duplicado', ip: ip });
      return res.status(409).json({
        erros: [
          emailDuplicado
            ? 'Ja existe uma conta cadastrada com este e-mail.'
            : 'Ja existe uma conta cadastrada com esta matricula.',
        ],
      });
    }

    const senhaHash = await hashPassword(senha);
    const novoTecnico = db
      .get('tecnicos')
      .insert({ nome: nome, matricula: matricula, email: email, cargo: cargo, senhaHash: senhaHash })
      .write();

    registrarLog('cadastro_realizado', { tecnicoId: novoTecnico.id, ip: ip });

    return res.status(201).json(dadosPublicosTecnico(novoTecnico));
  } catch (err) {
    console.error('[auth/register] erro inesperado:', err);
    return res.status(500).json({ erro: 'Erro interno ao processar cadastro.' });
  }
});

// POST /auth/login
server.post(
  '/auth/login',
  limitarLoginPorIp,
  limitarLoginPorConta,
  async (req, res) => {
    const ip = clientIp(req);
    try {
      const emailBruto = req.body && req.body.email;
      const senha = req.body && req.body.senha;

      if (typeof emailBruto !== 'string' || typeof senha !== 'string' || !emailBruto.trim() || !senha) {
        return res.status(400).json({ erro: 'Informe e-mail e senha.' });
      }

      const email = emailBruto.trim().toLowerCase();
      const tecnicos = db.get('tecnicos').value() || [];
      const tecnico = tecnicos.find((t) => (t.email || '').toLowerCase() === email);

      // verifyPassword usa um hash dummy internamente quando o usuario nao
      // existe, mantendo o tempo de resposta consistente (mitiga enumeracao
      // de contas via timing - OWASP A07).
      const senhaOk = await verifyPassword(senha, tecnico && tecnico.senhaHash);

      if (!tecnico || !senhaOk) {
        registrarLog('login_falhou', { ip: ip, email: email });
        return res.status(401).json({ erro: 'E-mail ou senha invalidos.' });
      }

      registrarLog('login_sucesso', { ip: ip, tecnicoId: tecnico.id });
      return res.status(200).json(dadosPublicosTecnico(tecnico));
    } catch (err) {
      console.error('[auth/login] erro inesperado:', err);
      return res.status(500).json({ erro: 'Erro interno ao processar login.' });
    }
  }
);

// Bloqueia escrita direta em /tecnicos e remove campos sensiveis das leituras.
server.use('/tecnicos', interceptarRespostaTecnicos, bloquearEscritaDiretaTecnicos);

// Demais rotas (epis, ordensServico, checklists, checklistItens, logs, e
// leitura de /tecnicos) continuam servidas pelo json-server.
server.use(router);

async function start() {
  await migrarSenhasEmTextoPuro();
  server.listen(PORT, HOST, () => {
    console.log('SafeStep backend rodando em http://' + HOST + ':' + PORT);
  });
}

start().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
