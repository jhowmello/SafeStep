/**
 * Hash e verificação de senhas usando scrypt (módulo nativo `crypto` do Node).
 *
 * Por que scrypt e não bcrypt/argon2?
 * O ambiente de build deste projeto não tem acesso à instalação de novos pacotes
 * npm (registro bloqueado). O OWASP Password Storage Cheat Sheet lista scrypt
 * como algoritmo aceitável quando Argon2id/bcrypt não estão disponíveis:
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 *
 * Parâmetros usados (N=2^16, r=8, p=1) correspondem à configuração "deve ter
 * pelo menos 64MB de RAM" recomendada pelo OWASP para scrypt.
 *
 * Formato armazenado: scrypt$N$r$p$<saltHex>$<hashHex>
 * Isso permite migrar parâmetros no futuro sem invalidar hashes antigos.
 */
const crypto = require('crypto');

const N = 65536; // 2^16
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;
const MAXMEM = 256 * 1024 * 1024; // margem acima do exigido por N/r/p

function scryptAsync(password, salt, keylen, params) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      keylen,
      { N: params.N, r: params.r, p: params.p, maxmem: MAXMEM },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey);
      }
    );
  });
}

async function hashPassword(plainPassword) {
  if (typeof plainPassword !== 'string' || plainPassword.length === 0) {
    throw new Error('Senha inválida para hashing.');
  }
  const salt = crypto.randomBytes(SALT_BYTES);
  const derivedKey = await scryptAsync(plainPassword, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

// Hash "dummy" fixo usado para comparação quando o usuário não existe,
// evitando que o tempo de resposta revele se um e-mail está cadastrado
// (mitigação de user enumeration via timing — OWASP A07).
const DUMMY_HASH = `scrypt$${N}$${R}$${P}$${'00'.repeat(SALT_BYTES)}$${'00'.repeat(KEYLEN)}`;

async function verifyPassword(plainPassword, storedHash) {
  const target = storedHash || DUMMY_HASH;
  const parts = target.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const derivedKey = await scryptAsync(plainPassword, salt, expected.length, {
      N: Number(nStr),
      r: Number(rStr),
      p: Number(pStr),
    });
    if (derivedKey.length !== expected.length) return false;
    return crypto.timingSafeEqual(derivedKey, expected);
  } catch {
    return false;
  }
}

function isHashed(value) {
  return typeof value === 'string' && value.startsWith('scrypt$');
}

module.exports = { hashPassword, verifyPassword, isHashed, DUMMY_HASH };
