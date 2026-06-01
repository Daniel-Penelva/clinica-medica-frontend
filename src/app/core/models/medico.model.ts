export interface EspecialidadeResponse {
  id: number;
  nome: string;
}

export interface MedicoRequest {
  nome: string;
  crm: string;
  email?: string;
  telefone?: string;
  especialidadeIds: number[];
}

export interface MedicoResponse {
  id: number;
  nome: string;
  crm: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  especialidades: EspecialidadeResponse[];
}
