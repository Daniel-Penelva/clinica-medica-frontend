import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [

    // Rota publica: Login
    { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)},

    // Rotas protegidas dentro do Shell (Navbar + Sidebar)
    { path: '', canActivate: [authGuard], 
        loadComponent: () => import('./shared/layout/shell/shell.component').then(m => m.ShellComponent), children:[
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]},

    // Qualquer rota não encontrada -> login
    { path: '**', redirectTo: 'login'},

];
