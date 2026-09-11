import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { UsuarioRequest, UsuarioResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  /**
   * Lista todos os usuários cadastrados no sistema.
   * Retorna um Observable contendo um array de usuários.
  */
  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.url);
  }

  /**
   * Busca um usuário pelo seu ID.
   * id: O ID do usuário a ser buscado.
   * Retorna um Observable contendo o usuário correspondente ao ID fornecido.
  */
  buscarPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.url}/${id}`);
  }

  /**
   * Cadastra um novo usuário no sistema.
   * request: Um objeto do tipo UsuarioRequest contendo os dados do usuário a ser cadastrado.
   * Retorna um Observable contendo o usuário cadastrado.
  */
  cadastrar(request: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.url, request);
  }

  /**
   * Atualiza os dados de um usuário existente no sistema.
   * id: O ID do usuário a ser atualizado.
   * request: Um objeto do tipo UsuarioRequest contendo os dados atualizados do usuário.
   * Retorna um Observable contendo o usuário atualizado.
  */
  atualizar(id: number, request: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.url}/${id}`, request);
  }

  /**
   * Desativa um usuário no sistema.
   * id: O ID do usuário a ser desativado.
   * Retorna um Observable vazio indicando que a operação foi concluída com sucesso.
  */
  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

}
