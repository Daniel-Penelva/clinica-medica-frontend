// Tipo para estado da consulta
export type StatusConsulta =
  | 'AGENDADA'
  | 'CONFIRMADA'
  | 'REALIZADA'
  | 'CANCELADA'
  | 'NAO_COMPARECEU';

// Dados para criar uma nova consulta
export interface ConsultaRequest {
  pacienteId: number;
  medicoId: number;
  dataHora: string; // formato: 'yyyy-MM-ddTHH:mm:ss'
}

// Dados para cancelar uma consulta
export interface CancelamentoRequest {
  motivo: string;
}

//  Dados completos de uma consulta (retornados do backend)
export interface ConsultaResponse {
  id: number;
  pacienteId: number;
  nomePaciente: string;
  medicoId: number;
  nomeMedico: string;
  crmMedico: string;
  dataHora: string;
  status: StatusConsulta;
  motivoCancelamento?: string;
  temProntuario: boolean;
}
