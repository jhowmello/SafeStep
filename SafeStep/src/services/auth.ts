import BASE_URL from './api';
import { Tecnico } from '../types';

const TIMEOUT_MS = 10000;

type ErroApi = { erro?: string; erros?: string[] };

async function fetchComTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function mensagemDeErro(corpo: ErroApi, padrao: string): string {
  if (corpo.erros && corpo.erros.length > 0) return corpo.erros.join('\n');
  if (corpo.erro) return corpo.erro;
  return padrao;
}

/**
 * Autentica o técnico via POST /auth/login (comparação de senha feita no
 * servidor, com hash + rate limiting). Nunca compara senha no cliente.
 */
export async function loginTecnico(email: string, senha: string): Promise<Tecnico> {
  const resposta = await fetchComTimeout(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  const corpo = await resposta.json().catch(() => ({} as ErroApi));

  if (!resposta.ok) {
    throw new Error(mensagemDeErro(corpo, 'Não foi possível entrar.'));
  }

  return corpo as Tecnico;
}

export interface DadosCadastro {
  nome: string;
  matricula: string;
  email: string;
  cargo: string;
  senha: string;
  confirmarSenha: string;
}

/**
 * Registra um novo técnico via POST /auth/register. A senha é enviada uma
 * única vez por HTTPS/HTTP e nunca persistida ou logada no cliente; toda a
 * validação de política de senha e hashing ocorre no servidor.
 */
export async function registerTecnico(dados: DadosCadastro): Promise<Tecnico> {
  const resposta = await fetchComTimeout(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const corpo = await resposta.json().catch(() => ({} as ErroApi));

  if (!resposta.ok) {
    throw new Error(mensagemDeErro(corpo, 'Não foi possível concluir o cadastro.'));
  }

  return corpo as Tecnico;
}
