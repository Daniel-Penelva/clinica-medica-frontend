import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtResponse, LoginRequest } from '../models/auth.model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Chaves usadas no localStorage para armazenar o token, o refresh token, role e o email
  private readonly TOKEN_KEY = 'clinica_token';
  private readonly REFRESH_KEY = 'clinica_refresh';
  private readonly ROLE_KEY = 'clinica_role';
  private readonly EMAIL_KEY = 'clinica_email';

  // Usando a função inject para injeção de dependências para HttpClient e Router (não necessita do construtor tradicional ao usar inject)
  private http = inject(HttpClient);
  private router = inject(Router);

  /**
   * Signal para monitorar o estado de autenticação do usuário. Estado reativo do usuário logado ou não.
   * Quando muda, os componentes que usam isLoggedIn atualizam automaticamente. Inicializado com o valor retornado
   * pela função hasToken(), que verifica se o token de autenticação está presente no LocalStorage.
   * Se o token existir, isLoggedIn será true, indicando que o usuário está autenticado; caso contrário, será false.
  */
  private _isLoggedIn = signal<boolean>(this.hasToken());
  private _role = signal<string>(this.getRole() ?? ''); // Inicializa com o valor do role ou uma string vazia se for null

  /**
   * Signals computados para expor o estado de autenticação e o role do usuário de forma reativa.
   * isLoggedIn: Indica se o usuário está logado ou não, baseado no valor do signal _isLoggedIn.
   * currentRole: Retorna o role atual do usuário, baseado no valor do signal _role.
   * isAdmin: Retorna true se o role do usuário for 'ADMIN', permitindo que os componentes verifiquem facilmente se o usuário é um administrador.
   * isMedico: Retorna true se o role do usuário for 'MEDICO', permitindo que os componentes verifiquem facilmente se o usuário é um médico.
   * 
   * Esses signals computados permitem que os componentes do Angular se inscrevam automaticamente para atualizações quando o estado de 
   * autenticação ou o role do usuário mudar, garantindo que a interface do usuário reflita sempre o estado atual do usuário logado e seu role.
   */
  readonly isLoggedIn = computed(() => this._isLoggedIn());
  readonly currentRole = computed(() => this._role());
  readonly isAdmin = computed(() => this._role() === 'ADMIN');
  readonly isMedico = computed(() => this._role() === 'MEDICO');


  //--- LOGIN ------------------------------------------------------

  /**
   * Este método é responsável por realizar o processo de login do usuário. Ele recebe um objeto do tipo LoginRequest, que contém as credenciais
   * de login (email e senha) do usuário. O método faz uma requisição HTTP POST para o endpoint de login da API, enviando as credenciais do usuário.
   * 
   * A resposta da API é esperada ser um objeto do tipo JwtResponse, que contém o token de autenticação, o refresh token, o role e o email do usuário.
   * 
   * Ao receber a resposta da API, o método utiliza o operador tap do RxJS para chamar a função salvarSessao(), que é responsável por armazenar 
   * os dados de autenticação do usuário no LocalStorage e atualizar os signals de estado de autenticação e role.
   * 
   * O método retorna um Observable de JwtResponse, permitindo que os componentes que chamam o método login possam se inscrever para receber a 
   * resposta da API e reagir a ela conforme necessário (por exemplo, redirecionar o usuário para uma página diferente após um login bem-sucedido).
   * 
   * @param request - Um objeto do tipo LoginRequest contendo as credenciais de login (email e senha) do usuário a ser autenticado.
   * @returns {Observable<JwtResponse>} - Retorna um Observable que emite a resposta da API contendo os dados de autenticação do usuário (token, refresh token, role e email) após um login bem-sucedido.
   */
  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http
        .post<JwtResponse>(`${environment.apiUrl}/auth/login`, request)
        .pipe(tap(response => this.salvarSessao(response)));
  }

  //--- LOGOUT ------------------------------------------------------

  /**
   * Este método é responsável por realizar o processo de logout do usuário.
   * Ele remove os dados de autenticação do usuário (token, refresh token, role e email) do LocalStorage usando as chaves definidas (TOKEN_KEY, REFRESH_KEY, ROLE_KEY e EMAIL_KEY).
   * 
   * Após limpar os dados de autenticação, o método atualiza o signal _isLoggedIn para false, indicando que o usuário não está mais autenticado, 
   * e também atualiza o signal _role para uma string vazia, indicando que o usuário não tem mais um role associado.
   * 
   * Por fim, o método redireciona o usuário para a página de login usando o Router, garantindo que o usuário seja levado para a tela de login após  realizar o logout.
   * 
   * @returns void - Este método não retorna nenhum valor, ele apenas realiza as ações de logout e redirecionamento do usuário.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    this._isLoggedIn.set(false);
    this._role.set('');
    this.router.navigate(['/login']);
  }

  //--- REFRESH TOKEN ------------------------------------------------------

  /**
   * Este método é responsável por realizar o processo de refresh token, que é usado para obter um novo token de autenticação quando o token atual expira.
   * 
   * Ele acessa o LocalStorage para obter o refresh token usando a chave definida em REFRESH_KEY. Se o refresh token estiver presente, ele faz uma requisição HTTP POST para o endpoint de refresh da API,
   * enviando o refresh token no cabeçalho da requisição. 
   * 
   * A resposta da API é esperada ser um objeto do tipo JwtResponse, que contém o novo token de autenticação, o novo refresh token, o role e o email do usuário.
   * 
   * Ao receber a resposta da API, o método utiliza o operador tap do RxJS para chamar a função salvarSessao(), que é responsável por armazenar 
   * os novos dados de autenticação do usuário no LocalStorage e atualizar os signals de estado de autenticação e role.
   * 
   * O método retorna um Observable de JwtResponse, permitindo que os componentes que chamam o método refreshToken possam se inscrever para receber 
   * a resposta da API e reagir a ela conforme necessário (por exemplo, atualizar o token de autenticação usado nas requisições subsequentes).
   * 
   * @returns {Observable<JwtResponse>} - Retorna um Observable que emite a resposta da API contendo os novos dados de autenticação do usuário (novo token, novo refresh token, role e email) após um refresh token bem-sucedido.
   */
  refreshToken(): Observable<JwtResponse> {
    
    const refreshToken = localStorage.getItem(this.REFRESH_KEY) ?? '';  // ?? Operador de coalescência nula para garantir que refreshToken seja uma string, mesmo que o valor no localStorage seja null

    return this.http
        .post<JwtResponse>(`${environment.apiUrl}/auth/refresh`, {}, { headers: { 'Refresh-Token': refreshToken } })
        .pipe(tap(response => this.salvarSessao(response)));
  }


  //--- GETTERS ------------------------------------------------------

  /**
   * Este método é um getter para o token de autenticação do usuário. Ele acessa o LocalStorage do navegador e retorna o valor 
   * associado à chave definida em TOKEN_KEY, que é onde o token de autenticação é armazenado.
   * Se o token estiver presente no LocalStorage, ele será retornado como uma string, caso contrário, o método retornará null.
   * 
   * @returns {string | null} - Retorna o token de autenticação se estiver presente no LocalStorage ou null caso contrário.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Este método é um getter para o email do usuário. Ele acessa o LocalStorage do navegador e retorna o valor 
   * associado à chave definida em EMAIL_KEY, que é onde o email do usuário é armazenado.
   * Se o email estiver presente no LocalStorage, ele será retornado como uma string, caso contrário, o método retornará null.
   * 
   * @returns {string | null} - Retorna o email do usuário se estiver presente no LocalStorage ou null caso contrário.
   */
  getEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  /**
   * Este método é um getter para o estado de autenticação do usuário. Ele retorna o valor atual do signal isLoggedIn, que indica se o usuário está logado ou não.
   * O valor retornado por isLoggedIn() é reativo, o que significa que os componentes que dependem desse valor serão automaticamente atualizados quando ele mudar.
   * 
   * @returns {string | null} - Retorna o valor atual do signal isLoggedIn, indicando se o usuário está logado ou não.
   */
  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }


  //--- PRIVADOS ------------------------------------------------------

  /**
   * Este método verifica se o token de autenticação está presente no LocalStorage.
   * Ele retorna true se o token existir, indicando que o usuário está autenticado, ou false caso contrário.
   * 
   * <code> !!localStorage.getItem(this.TOKEN_KEY) </code>
   * O operador de negação dupla (!!) é usado para converter o valor retornado por LocalStorage.getItem() em um booleano.
   * Se o token existir, getItem() retornará uma string (que é "truthy"), e a negação dupla a converterá para true.
   * 
   * @returns {boolean} - Retorna true se o token existir no LocalStorage, ou false caso contrário.
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Este método é responsável por salvar os dados de autenticação do usuário no LocalStorage após um login bem-sucedido.
   * Ele recebe um objeto do tipo JwtResponse, que contém o token de autenticação, o refresh token, o role e o email do usuário.
   * O método armazena esses valores no LocalStorage usando as chaves definidas (TOKEN_KEY, REFRESH_KEY, ROLE_KEY e EMAIL_KEY).
   * Além disso, ele atualiza o signal _isLoggedIn para true, indicando que o usuário está agora autenticado, 
   * e também atualiza o signal _role com o valor do role do usuário, permitindo que os componentes que dependem do role sejam atualizados automaticamente.
   * 
   * @param response - Um objeto do tipo JwtResponse contendo os dados de autenticação do usuário a serem salvos no LocalStorage.
   */
  private salvarSessao(response: JwtResponse): void {
    localStorage.setItem(this.TOKEN_KEY,   response.token);
    localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    localStorage.setItem(this.ROLE_KEY,    response.role);
    localStorage.setItem(this.EMAIL_KEY,   response.email);
    this._isLoggedIn.set(true);
    this._role.set(response.role);
  }

}

/**
 * Este serviço de autenticação é responsável por gerenciar o processo de login, logout e refresh token do usuário na aplicação clinica medica frontend.
 * 
 * Ele utiliza o HttpClient para fazer requisições à API de autenticação, o Router para redirecionar o usuário após o logout, e os signals do Angular 
 * para manter o estado de autenticação e role do usuário de forma reativa.
 * 
 * OBS. Como assim forma reativa? A forma reativa é aquela em que os componentes que dependem do estado de autenticação ou do role do usuário 
 * são automaticamente atualizados quando esses valores mudam, sem a necessidade de intervenção manual.
*/
