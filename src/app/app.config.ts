import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
  ]
};

/**
 * Define as configurações de rotas e serviços globais para a aplicação, como:
 *  -> Rotas de aplicação - provideRouter(routes)
 *  -> HttpClient com o interceptor JWT registrado - provideHttpClient(withInterceptors([jwtInterceptor]))
 *  -> Animações do Angular Material - provideAnimationsAsync()
*/