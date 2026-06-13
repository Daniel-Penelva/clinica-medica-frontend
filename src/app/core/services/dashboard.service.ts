import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ConsultaHoje, ConsultasPorEspecialidade, ConsultasPorMes, DashboardResumo } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);
  private url  = `${environment.apiUrl}/dashboard`;

  /**
   * Retorna cards principais do dashboard (KPIs gerais).
   * 
   * <p>Métricas incluídas: total pacientes, médicos, consultas hoje/mês, agendadas e realizadas.</p>
   * 
   * @return Resumo com KPIs principais da clínica
   */
  getResumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo>(`${this.url}/resumo`);
  }

  /**
   * Lista consultas agendadas para o dia atual (00:00 - 23:59).
   * 
   * @return Lista ordenada das consultas de hoje com paciente, médico e status
   */
  getConsultasHoje(): Observable<ConsultaHoje[]> {
    return this.http.get<ConsultaHoje[]>(`${this.url}/consultas-hoje`);
  }

  /**
   * Retorna contagem de consultas agrupadas por status.
   * 
   * <p>Status: AGENDADA, CONFIRMADA, REALIZADA, CANCELADA, NÃO COMPARECEU.</p>
   * 
   * @return Totais por cada status da consulta
   */
  getPorStatus(): Observable<any> {
    return this.http.get<any>(`${this.url}/por-status`);
  }

  /**
   * Retorna evolução mensal de consultas dos últimos 6 meses.
   * 
   * <p>Formato: "Jan/2026", "Fev/2026", etc. ordenado cronologicamente.</p>
   * 
   * @return Lista [mês/ano, total] dos últimos 6 meses
   */
  getPorMes(): Observable<ConsultasPorMes[]> {
    return this.http.get<ConsultasPorMes[]>(`${this.url}/por-mes`);
  }

  /**
   * Retorna ranking de consultas por especialidade com percentuais.
   * 
   * <p>Ordenado por volume DESC com cálculo de percentual sobre total geral.</p>
   * 
   * @return Lista [especialidade, total, percentual%] ordenada por volume
   */
  getPorEspecialidade(): Observable<ConsultasPorEspecialidade[]> {
    return this.http.get<ConsultasPorEspecialidade[]>(
      `${this.url}/por-especialidade`);
  }

  /**
   * Lista próximas consultas dos próximos 7 dias.
   * 
   * <p>Filtra apenas AGENDADA/CONFIRMADA, ordenadas por horário.</p>
   * 
   * @return Lista das próximas 7 dias de consultas ativas
   */
  getProximas(): Observable<ConsultaHoje[]> {
    return this.http.get<ConsultaHoje[]>(`${this.url}/proximas`);
  }
}
