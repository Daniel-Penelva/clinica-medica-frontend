import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard funcional para proteger rotas autenticadas.
 * Redireciona para /login se o usuário não estiver autenticado.
*/
export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  /**
   * Verifica se o usuário está logado. Se estiver, permite o acesso à rota. Caso contrário, redireciona para a página de login.
  */
  if (authService.isLoggedIn()) {
    return true; // usuário logado, permite acesso
  }

  /**
   * Não logado - redireciona para login
   * returnUrl: salva a rota (URL) que o usuário tentou acessar para que, após o login, ele possa ser redirecionado de volta para essa rota.
  */
  router.navigate(['/login'], { queryParams: { returnUrl: state.url}}); 
  return false;  // usuário não logado, acesso negado
};


/**
 * Guard para verificar role específico para acessar rotas. Exemplo de uso: ADMIN
 * Uso: canActivate: [() => roleGuard('ADMIN')]
*/
export const roleGuard = (role: string): CanActivateFn => {

  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    /**
     * Verifica se o usuário está logado. Se não estiver, redireciona para a própria página de login.
    */
    if (authService.currentRole() === role) {
      return true; // usuário tem o role necessário para acessar a rota
    }

    router.navigate(['/dashboard']); // redireciona para dashboard
    return false; // usuário não tem o role necessário, acesso negado
  };
};
