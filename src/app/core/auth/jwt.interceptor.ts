import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  /** Essas variáveis são injetadas usando a função 'inject' que é a maneira de acessar serviços em interceptors no Angular.
   * 'AuthService' é usado para obter o token de autenticação.
   * O 'Router' vai ser usado para redirecionar o usuário caso o token seja inválido ou ausente.
   * O 'token' é obtido do 'AuthService'. 
   * 
   * Injeta o Bearer token no header de autorização em todas as requisições HTTP autenticadas e redireciona para a página de 
   * login se o token for inválido ou ausente.
   * 
   * Trata erro 401 (Unauthorized) tentando renovar o token automaticamente utilizando o método 'refreshToken' do 'AuthService'.
   * Se a renovação do token falhar, o usuário é deslogado e redirecionado para a página de login.
   */
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  /**
   * Se tem o token, clona a requisição original adicionando o header 'Authorization' com o valor 'Bearer {token}'.
   * Se não tem o token, a requisição original é usada sem modificações.
   * 
   * 'req.clone' é usado para criar uma nova requisição com os headers modificados, já que as requisições HTTP no Angular são imutáveis.
   * O header 'Authorization' é definido com o formato 'Bearer {token}', que é o padrão para tokens JWT.
   * 
   * O interceptor garante que todas as requisições HTTP que exigem autenticação tenham o token JWT incluído no header, permitindo que o 
   * backend valide a autenticidade do usuário. Se o token estiver ausente ou inválido, o backend pode responder com um erro 401, que será 
   * tratado posteriormente para tentar renovar o token ou redirecionar o usuário para a página de login.
  */
  const authReq = token ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }) : req;

  /**
   * O método 'next' é chamado para passar a requisição modificada (ou original) para o próximo interceptor ou para o backend.
   * O operador 'catchError' é usado para interceptar erros HTTP, especificamente o erro 401 (Unauthorized).
   * Se um erro 401 for detectado e um token estiver presente, o interceptor tenta renovar o token usando o método 'refreshToken' do 'AuthService'.
   * Se a renovação do token for bem-sucedida, a requisição original é clonada novamente com o novo token e enviado novamente.
   * Se a renovação do token falhar, o usuário é deslogado e redirecionado para a página de login, e o erro é propagado para ser tratado em outro lugar da aplicação.
   * 
   * switchMap é usado para encadear a operação de renovação do token e a repetição da requisição original, grantindo que a nova requisição só 
   * será enviada após a renovação do token ser concluída com sucesso.
   * 
  */
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Se recebeu 401 (Unauthorized) e tem refresh token, tenta renovar o token automaticamente 
      if (error.status === 401 && authService.getToken()) {
        return authService.refreshToken().pipe(switchMap(response => {
          const newReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${response.token}`)}); // repete a requisição original com o novo token
          return next(newReq);
        }), catchError(refreshError => {
          authService.logout();  // Se o refresh token falhar, desloga o usuário e redireciona para a página de login
          return throwError(() => refreshError);
        }));
      }
      return throwError(() => error);
    })
  );
};

/**
 * O 'jwtInterceptor' é um interceptor HTTP que tem a função de adicionar o token JWT no header de autorização de todas as requisições HTTP
 * autenticadas. Ele também lida com erros de autenticação, tentando renovar o token automaticamente se um erro 401 for detectado, e redireciona 
 * o usuário para a página de login se a renovação do token falhar ou se o token estiver ausente.
 * 
 * Aqui, o interceptor é executado automaticamente em todas as requisições HTTP feitas pela aplicação. Ele injeta o header 'Authorization' com o 
 * Bearer token obtido do 'AuthService' sem precisar adicionar manualmente em cada chamada HTTP. 
 * 
*/
