/**
 * Rate limiting em memória, sem dependências externas (sem acesso ao registro
 * npm neste ambiente). Mitiga força bruta e enumeração de contas em endpoints
 * sensíveis (OWASP A07 — Identification and Authentication Failures).
 *
 * Janela fixa por chave (IP, ou IP+e-mail). Adequado para um único processo
 * Node; em produção com múltiplas instâncias seria necessário um store
 * compartilhado (ex: Redis).
 */

function createRateLimiter({ windowMs, max, keyFn, message }) {
  const hits = new Map(); // key -> { count, resetAt }

  // Limpeza periódica para não crescer indefinidamente.
  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, Math.min(windowMs, 60_000));
  sweepInterval.unref?.();

  return function rateLimitMiddleware(req, res, next) {
    const key = keyFn(req);
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        erro: message || 'Muitas tentativas. Tente novamente mais tarde.',
      });
    }

    next();
  };
}

function clientIp(req) {
  // Confia apenas na conexão direta (sem X-Forwarded-For) pois não há proxy
  // confiável configurado neste ambiente de desenvolvimento/acadêmico.
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

module.exports = { createRateLimiter, clientIp };
