// O backend nunca retorna a senha (nem o hash) de um técnico nas respostas
// da API, então o tipo usado pelo cliente não inclui esse campo.
export interface Tecnico {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  cargo: string;
}

export interface Epi {
  id: number;
  nome: string;
  ca: string;
  norma: string;
}

export interface OrdemServico {
  id: number;
  descricao: string;
  local: string;
  tecnicoId: number;
  status: 'pendente' | 'concluida' | 'reprovada';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  normas: string[];
  episObrigatorios: number[];
  dataCriacao: string;
  dataLimite: string;
}

export interface ChecklistItem {
  id: number;
  descricao: string;
  norma: string;
  obrigatorio: boolean;
}

export interface Checklist {
  id: number;
  ordemServicoId: number;
  tecnicoId: number;
  dataRealizacao: string;
  aprovado: boolean;
  itensConfirmados: number[];
  observacoes: string;
}

export interface Log {
  id: number;
  ordemServicoId: number;
  tecnicoId: number;
  acao: string;
  resultado: 'aprovado' | 'reprovado';
  timestamp: string;
}

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  HomeTabs: undefined;
  Checklist: { ordemId: number };
  Resultado: { aprovado: boolean; ordemId: number };
  CriarOrdem: undefined;
};
