/**
 * Política de senha baseada em:
 * - OWASP ASVS v4.0, seção V2.1 (Password Security Requirements)
 * - OWASP Authentication Cheat Sheet
 *
 * Critérios aplicados:
 * 1. Comprimento mínimo de 10 caracteres (ASVS V2.1.1 exige >=8; usamos margem extra).
 * 2. Comprimento máximo de 128 caracteres (ASVS V2.1.2 — evita DoS no algoritmo de hash
 *    com senhas extremamente longas, sem proibir frases-senha legítimas).
 * 3. Pelo menos 3 das 4 classes de caractere (minúscula, maiúscula, número, símbolo) —
 *    defesa em profundidade complementar à exigência de comprimento.
 * 4. Bloqueio de senhas presentes em lista de senhas comuns/previsíveis
 *    (ASVS V2.1.7 — verificação contra senhas vazadas/conhecidas).
 * 5. Bloqueio de senha igual ou que contenha o e-mail, nome ou matrícula do usuário
 *    (ASVS V2.1.9 — não permitir contexto pessoal na senha).
 */

// Lista local de senhas extremamente comuns (subconjunto representativo das listas
// públicas "top breached passwords" usadas como referência pelo ASVS V2.1.7).
const SENHAS_COMUNS = new Set([
  '123456', '12345678', '123456789', '1234567890', 'password',
  'senha123', 'senha1234', 'qwerty123', 'qwertyuiop', '111111111',
  'abc123456', '12345678910', 'iloveyou1', 'admin12345', 'welcome123',
  'letmein123', 'monkey12345', 'football1', 'password1', 'senha12345',
  '1q2w3e4r5t', 'asdfghjkl1', '0123456789', 'trocar123', 'mudar1234',
]);

const MIN_LENGTH = 10;
const MAX_LENGTH = 128;

function classesPresentes(senha) {
  let classes = 0;
  if (/[a-z]/.test(senha)) classes++;
  if (/[A-Z]/.test(senha)) classes++;
  if (/[0-9]/.test(senha)) classes++;
  if (/[^a-zA-Z0-9]/.test(senha)) classes++;
  return classes;
}

/**
 * @param {string} senha
 * @param {{ email?: string, nome?: string, matricula?: string }} contexto
 * @returns {{ valido: boolean, erros: string[] }}
 */
function validarSenha(senha, contexto = {}) {
  const erros = [];

  if (typeof senha !== 'string' || senha.length === 0) {
    return { valido: false, erros: ['Senha é obrigatória.'] };
  }

  if (senha.length < MIN_LENGTH) {
    erros.push(`A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`);
  }
  if (senha.length > MAX_LENGTH) {
    erros.push(`A senha deve ter no máximo ${MAX_LENGTH} caracteres.`);
  }
  if (classesPresentes(senha) < 3) {
    erros.push('A senha deve combinar ao menos 3 destes 4 tipos: letra minúscula, letra maiúscula, número e símbolo.');
  }
  if (SENHAS_COMUNS.has(senha.toLowerCase())) {
    erros.push('Essa senha é muito comum e foi encontrada em listas de senhas vazadas. Escolha outra.');
  }

  const senhaLower = senha.toLowerCase();
  const emailLocal = (contexto.email || '').split('@')[0].toLowerCase();
  const nome = (contexto.nome || '').toLowerCase().trim();
  const matricula = (contexto.matricula || '').toLowerCase();

  if (emailLocal.length >= 3 && senhaLower.includes(emailLocal)) {
    erros.push('A senha não pode conter parte do seu e-mail.');
  }
  if (matricula.length >= 3 && senhaLower.includes(matricula)) {
    erros.push('A senha não pode conter sua matrícula.');
  }
  if (nome.length >= 3) {
    const primeiroNome = nome.split(/\s+/)[0];
    if (primeiroNome.length >= 3 && senhaLower.includes(primeiroNome)) {
      erros.push('A senha não pode conter seu nome.');
    }
  }

  return { valido: erros.length === 0, erros };
}

module.exports = { validarSenha, MIN_LENGTH, MAX_LENGTH };
