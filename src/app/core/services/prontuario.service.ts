import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProntuarioRequest, ProntuarioResponse } from '../models/prontuario.model';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/paciente.model';
import { ConsultaResponse } from '../models/consulta.model';

@Injectable({
  providedIn: 'root'
})
export class ProntuarioService {

  /**
   * Injeção de dependência do HttpClient para fazer requisições HTTP e a definição da URL base da API de convênios 
   * e prontuários.
   * */ 
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/prontuarios`;
  private urlCons = `${environment.apiUrl}/consultas`;

  /**
   * Método para criar um novo prontuário na API. Recebe um objeto do tipo ProntuarioRequest como parâmetro, que 
   * contém os dados do prontuário a ser criado. Retorna um Observable contendo um objeto do tipo ProntuarioResponse,
   * que representa os dados do prontuário recém-criado.
   * (Somente médicos podem criar prontuários)
  */
  criar(request: ProntuarioRequest): Observable<ProntuarioResponse> {
    return this.http.post<ProntuarioResponse>(this.url, request);
  }

  /**
   * Método para buscar um prontuário específico pelo ID da consulta. Recebe o ID da consulta como parâmetro e retorna
   * um Observable contendo um objeto do tipo ProntuarioResponse, que representa os dados do prontuario encontrado.
  */
  buscarPorConsulta(consultaId: number): Observable<ProntuarioResponse> {
    return this.http.get<ProntuarioResponse>(`${this.url}/consulta/${consultaId}`);
  }

  /**
   * Método para atualizar os dados de um prontuário existente na API. Recebe o ID do prontuário a ser atualizado e um objeto
   * do tipo ProntuarioRequest contendo os novos dados do prontuário. Retorna um Observable contendo um objeto do tipo
   * ProntuarioResponse, que representa os dados atualizados do prontuário.
  */
  atualizar(id: number, request: ProntuarioRequest): Observable<ProntuarioResponse> {
    return this.http.put<ProntuarioResponse>(`${this.url}/${id}`, request);
  }

  /**
   * Método para buscar todas as consultas realizadas por um paciente específico. Recebe o ID do paciente, o número da página
   * e o tamanho da página como parâmetros. Retorna um Observable contendo um objeto do tipo PageResponse<ConsultaResponse>,
   * que representa os dados das consultas realizadas pelo paciente, incluindo informações de paginação.
  */
  buscarConusltasRealizadasPorPaciente(pacienteId: number, page: number, size: number): Observable<PageResponse<ConsultaResponse>> {
    // Criação de parâmetros de consulta para paginação e ordenação dos resultados 
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'dataHora,desc');

    return this.http.get<PageResponse<ConsultaResponse>>(`${this.urlCons}/paciente/${pacienteId}`, { params });
  }
}
