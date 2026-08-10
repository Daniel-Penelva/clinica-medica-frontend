import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConvenioRequest, ConvenioResponse } from '../models/convenio.model';

@Injectable({
  providedIn: 'root'
})
export class ConvenioService {

  /**
   * Injeção de dependência do HttpClient para fazer requisições HTTP e a definição da URL base da API de convênios.*/ 
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/convenios`;

  /**
   * Método para listar todos os convênios disponíveis na API. Retorna um Observable contendo um array de objetos do 
   * tipo ConvenioResponse, que representa os dados de cada convênio.
  */
  listar(): Observable<ConvenioResponse[]> {
    return this.http.get<ConvenioResponse[]>(this.url);
  }

  /**
   * Método para buscar um convênio específico pelo seu ID. Recebe o ID do convênio como parâmetro e retorna um Observable
   * contendo um objeto do tipo ConvenioResponse, que representa os dados do convênio encontrado.
  */
  buscarPorId(id: number): Observable<ConvenioResponse> {
    return this.http.get<ConvenioResponse>(`${this.url}/${id}`);
  }

  /**
   * Método para cadastrar um novo convênio na API. Recebe um objeto do tipo ConvenioRequest como parâmetro, que contém
   * os dados do convênio a ser cadastrado. Retorna um Observable contendo um objeto do tipo ConvenioResponse,
   * que representa os dados do convênio recém-cadastrado.
  */
  cadastrar(request: ConvenioRequest): Observable<ConvenioResponse> {
    return this.http.post<ConvenioResponse>(this.url, request);
  }

  /**
   * Método para atualizar os dados de um convênio existente na API. Recebe o ID do convênio a ser atualizado e um objeto
   * do tipo ConvenioRequest contendo os novos dados do convênio. Retorna um Observable contendo um objeto do tipo
   * ConvenioResponse, que representa os dados atualizados do convênio.
  */
  atualizar(id: number, request: ConvenioRequest): Observable<ConvenioResponse> {
    return this.http.put<ConvenioResponse>(`${this.url}/${id}`, request);
  }

  /**
   * Método para desativar um convênio existente na API. Recebe o ID do convênio a ser desativado como parâmetro e retorna
   * im Observable do tipo void, indicando que a operação foi concluída com sucesso.
  */
  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
