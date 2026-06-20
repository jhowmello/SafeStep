/**
 * Validacao e sanitizacao de entrada (OWASP A03 - Injection / Input Validation).
 * Todo dado vindo do cliente e tratado como nao confiavel.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MATRICULA_REGEX = /^[A-Za-z0-9]{4,12}$/;
// \p{L} cobre letras Unicode (inclui acentos) sem precisar de bytes
// acentuados literais no arquivo-fonte.
const NOME_REGEX = /^[\p{L}' -]{2,80}$/u;

// Remove caracteres de controle (ASCII < 32 e DEL/127) sem usar escapes de
// regex para esses codigos, evitando bytes de controle literais no arquivo.
function stripControlChars(value) {
  let out = '';
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 32 && code !== 127) {
      out += value[i];
    }
  }
  return out;
}

function trimToString(value) {
  if (typeof value !== 'string') return '';
  return stripControlChars(value).trim();
}

function validarCadastro(body) {
  const erros = [];

  const nome = trimToString(body && body.nome);
  const matricula = trimToString(body && body.matricula).toUpperCase();
  const email = trimToString(body && body.email).toLowerCase();
  const cargo = trimToString(body && body.cargo);
  const senha = typeof (body && body.senha) === 'string' ? body.senha : '';

  if (!nome || !NOME_REGEX.test(nome)) {
    erros.push('Nome invalido. Use apenas letras e espacos (2 a 80 caracteres).');
  }
  if (!matricula || !MATRICULA_REGEX.test(matricula)) {
    erros.push('Matricula invalida. Use 4 a 12 caracteres alfanumericos.');
  }
  if (!email || !EMAIL_REGEX.test(email) || email.length > 254) {
    erros.push('E-mail invalido.');
  }
  if (!cargo || cargo.length < 2 || cargo.length > 60) {
    erros.push('Cargo invalido (2 a 60 caracteres).');
  }

  return {
    erros,
    dados: { nome, matricula, email, cargo, senha },
  };
}

module.exports = { validarCadastro, trimToString, EMAIL_REGEX };
