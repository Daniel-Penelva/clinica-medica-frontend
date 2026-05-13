import { Routes } from '@angular/router';

export const routes: Routes = [

    // Rota publica: Login
    { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)},

    // Qualquer rota não encontrada -> login
    { path: '**', redirectTo: 'login'},

];
