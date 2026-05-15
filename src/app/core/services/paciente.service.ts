import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PacienteRequest, PacienteResponse, PageResponse } from '../models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  /**
   * Realiza injeção para HttpClient e para url para a base para chamadas
   */
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pacientes`;

  /**
   * Lista paginada de pacientes ativos
   */
  listar(page: number, size: number, sort: string = 'nome,asc'): Observable<PageResponse<PacienteResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    return this.http.get<PageResponse<PacienteResponse>>(this.url, { params });
  }

  /**
   * Buscar por nome e paginação
  */
  buscarPorNome(nome: string,page: number,size: number): Observable<PageResponse<PacienteResponse>> {
    const params = new HttpParams()
      .set('nome', nome)
      .set('page', page)
      .set('size', size)
      .set('sort', 'nome,asc');
    return this.http.get<PageResponse<PacienteResponse>>(`${this.url}/buscar`, { params });
  }

  /**
   * Buscar por Id
  */
  buscarPorId(id: number): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.url}/${id}`);
  }

  /**
   * Cadastrar novo paciente
  */
  cadastrar(request: PacienteRequest): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(this.url, request);
  }

  /**
   * Atualizar paciente existente
  */
  atualizar(id: number, request: PacienteRequest): Observable<PacienteResponse> {
    return this.http.put<PacienteResponse>(`${this.url}/${id}`, request);
  }

  /**
   * Desativar paciente (exclusão lógica)
  */
  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
