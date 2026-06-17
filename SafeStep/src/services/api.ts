// SECURITY: URL da API carregada via variável de ambiente.
// Nunca hardcode IPs ou URLs sensíveis no código-fonte.
// Configure o arquivo .env (veja .env.example) com EXPO_PUBLIC_API_URL.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default BASE_URL;
