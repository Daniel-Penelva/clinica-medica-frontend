export interface DashboardResumo {
  totalPacientesAtivos: number;
  totalMedicosAtivos: number;
  consultasHoje: number;
  consultasMesAtual: number;
  consultasAgendadas: number;
  consultasRealizadasMes: number;
}

export interface ConsultaHoje {
  id: number;
  dataHora: string;
  nomePaciente: string;
  nomeMedico: string;
  especialidade: string;
  status: string;
}

export interface ConsultasPorMes {
  mes: string;
  ano: number;
  numeroMes: number;
  total: number;
}

export interface ConsultasPorEspecialidade {
  especialidade: string;
  total: number;
  percentual: number;
}
