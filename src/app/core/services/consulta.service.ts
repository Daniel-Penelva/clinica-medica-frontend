import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/paciente.model';
import { CancelamentoRequest, ConsultaRequest, ConsultaResponse } from '../models/consulta.model';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/consultas`;

  /**
   * Lista todas as consultas com paginação.
   * 
   * @param page Número da página (0-indexado)
   * @param size Quantidade de itens por página
   * @return Observable com página de consultas ordenadas por dataHora
   */
  listar(page: number, size: number): Observable<PageResponse<ConsultaResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'dataHora,asc');

    return this.http.get<PageResponse<ConsultaResponse>>(this.url, { params });
  }

  /**
   * Busca consulta específica por ID.
   * 
   * @param id ID da consulta
   * @return Dados completos da consulta
   */
  buscarPorId(id: number): Observable<ConsultaResponse> {
    return this.http.get<ConsultaResponse>(`${this.url}/${id}`);
  }

  /**
   * Lista consultas de um paciente específico com paginação.
   * 
   * @param pacienteId ID do paciente
   * @param page Número da página (0-indexado)
   * @param size Quantidade de itens por página
   * @return Lista paginada de consultas do paciente
   */
  listarPorPaciente(pacienteId: number, page: number, size: number): Observable<PageResponse<ConsultaResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'dataHora,asc');

      return this.http.get<PageResponse<ConsultaResponse>>(`${this.url}/paciente/${pacienteId}`, { params });
  }

  /**
   * Agenda uma nova consulta.
   * 
   * @param request Dados da consulta (paciente, médico, data/hora)
   * @return Consulta criada com status AGENDADA
   */
  agendar(request: ConsultaRequest): Observable<ConsultaResponse> {
    return this.http.post<ConsultaResponse>(this.url, request);
  }

  /**
   * Confirma presença do paciente na consulta.
   * 
   * @param id ID da consulta
   * @return Consulta com status CONFIRMADA
   */
  confirmar(id: number): Observable<ConsultaResponse> {
    return this.http.patch<ConsultaResponse>(`${this.url}/${id}/confirmar`, {});
  }

  /**
   * Cancela consulta com motivo especificado.
   * 
   * @param id ID da consulta
   * @param request Motivo do cancelamento
   * @return Consulta com status CANCELADA
   */
  cancelar(id: number, request: CancelamentoRequest): Observable<ConsultaResponse> {
    return this.http.patch<ConsultaResponse>(`${this.url}/${id}/cancelar`, request);
  }

  /**
   * Marca consulta como realizada pelo médico.
   * 
   * @param id ID da consulta
   * @return Consulta com status REALIZADA
   */
  realizar(id: number): Observable<ConsultaResponse> {
    return this.http.patch<ConsultaResponse>(`${this.url}/${id}/realizar`, {});
  }

  /**
   * Registra não comparecimento do paciente.
   * 
   * @param id ID da consulta
   * @return Consulta com status NÃO COMPARECEU
   */
  naoCompareceu(id: number): Observable<ConsultaResponse> {
    return this.http.patch<ConsultaResponse>(`${this.url}/${id}/nao-compareceu`, {});
  }
}
