export interface EnderecoDTO {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface PacienteRequest {
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';
  endereco?: EnderecoDTO;
  convenioId?: number;
}

export interface PacienteResponse {
  id: number;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  idade?: number;
  sexo?: string;
  endereco?: EnderecoDTO;
  convenio?: string;
  ativo: boolean;
}

// Interface para resposta paginada (usada em todas as listagens)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}
