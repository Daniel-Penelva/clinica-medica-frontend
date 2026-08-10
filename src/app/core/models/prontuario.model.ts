export interface ProntuarioRequest {
  consultaId: number;
  anamnese: string;
  diagnostico: string;
  prescricao?: string;
  observacoes?: string;
}

export interface ProntuarioResponse {
  id: number;
  consultaId: number;
  pacienteId: number;
  nomePaciente: string;
  medicoId: number;
  nomeMedico: string;
  dataConsulta: string;
  anamnese: string;
  diagnostico: string;
  prescricao?: string;
  observacoes?: string;
  criadoEm: string;
}
