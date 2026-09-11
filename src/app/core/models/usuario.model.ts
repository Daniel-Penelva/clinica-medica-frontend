export type TipoUsuario = 'ADMIN' | 'MEDICO' | 'RECEPCIONISTA';

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha?: string; // opcional na edicao
  role: TipoUsuario;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  role: TipoUsuario;
  ativo: boolean;
}
