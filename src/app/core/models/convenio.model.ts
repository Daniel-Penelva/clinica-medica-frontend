export interface ConvenioRequest {
  nome: string;
  registro: string;
}

export interface ConvenioResponse {
  id: number;
  nome: string;
  registro: string;
  ativo: boolean;
}
