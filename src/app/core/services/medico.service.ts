import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { EspecialidadeResponse, MedicoRequest, MedicoResponse } from '../models/medico.model';
import { PageResponse } from '../models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  // Injeção de dependência
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/medicos`;
  private urlEsp = `${environment.apiUrl}/especialidades`;

  /**
   * Lista os médicos com paginação e ordenação por nome (ascendente)
   * @param page O número da página (0-based)
   * @param size O número de itens por página
   * @return Um Observable contendo a resposta paginada de médicos
   */
  listar(page: number, size: number): Observable<PageResponse<MedicoResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'nome,asc');

    return this.http.get<PageResponse<MedicoResponse>>(this.url, { params });
  }

  /**
   * Busca médicos por nome com paginação e ordenação por nome (ascendente)
   * @param nome O nome do médico a ser buscado
   * @param page O número da página (0-based)
   * @param size O número de itens por página
   * @return Um Observable contendo a resposta paginada de médicos que correspondem ao nome buscado
  */
  buscarPorNome(nome: string, page: number, size: number,): Observable<PageResponse<MedicoResponse>> {
    const params = new HttpParams()
      .set('nome', nome)
      .set('page', page)
      .set('size', size)
      .set('sort', 'nome,asc');

      return this.http.get<PageResponse<MedicoResponse>>(`${this.url}/buscar`, { params });
  }

  /**
   * Busca um médico por ID
   * @param id O ID do médico a ser buscado
   * @return Um Observable contendo a resposta do médico encontrado
  */
  buscarPorId(id: number): Observable<MedicoResponse> {
    return this.http.get<MedicoResponse>(`${this.url}/${id}`);
  }

  /**
   * Cadastra um novo médico
   * @param request O objetivo contendo os dados do médico a ser cadastrado
   * @return Um Observable contendo a resposta do médico cadastrado
  */
  cadastrar(request: MedicoRequest): Observable<MedicoResponse> {
    return this.http.post<MedicoResponse>(this.url, request);
  }

  /**
   * Atualiza um médico existente
   * @param id O ID do médico a ser atualizado
   * @param request O objetivo contendo os dados do médico a ser atualizado
   * @return Um Observable contendo a resposta do médico atualizado
  */
  atualizar(id: number, request: MedicoRequest): Observable<MedicoResponse> {
    return this.http.put<MedicoResponse>(`${this.url}/${id}`, request);
  }

  /**
   * Desativa um médico existente
   * @param id O ID do médico a ser desativado
   * @return Um Observable contendo a resposta da operação de desativação
  */
  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  //--------- Especialidades ---------------------------------------------------

  /**
   * Lista todas as especialidades disponíveis
   * @return Um Observable contendo a lista de especialidades disponíveis
  */
  listarEspecialidades(): Observable<EspecialidadeResponse[]> {
    return this.http.get<EspecialidadeResponse[]>(this.urlEsp);
  }

  /**
   * Adiciona uma especialidade a um médico existente
   * @param medicoId O ID do médico ao qual a especialidade será adicionada
   * @param espId O ID da especialidade a ser adicionada ao médico
   * @return Um Observable contendo a resposta do médico atualizado com a nova especialidade adicionada
  */
  adicionarEspecialidade(medicoId: number, espId: number): Observable<MedicoResponse> {
    return this.http.post<MedicoResponse>(`${this.url}/${medicoId}/especialidades/${espId}`, {});
  }

  /**
   * Remove uma especialidade de um médico existente
   * @param medicoId O ID do método ao qual a especialidade será removida
   * @param espId O ID da especialidade a ser removida do médico
   * @return Um Observable contendo a resposta do médico atualizado com a especialidade removida
  */
  removerEspecialidade(medicoId: number, espId: number): Observable<MedicoResponse> {
    return this.http.delete<MedicoResponse>(`${this.url}/${medicoId}/especialidades/${espId}`);
  }
}
