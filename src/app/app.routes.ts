import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [

    // Rota publica: Login
    { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)},

    // Rotas protegidas dentro do Shell (Navbar + Sidebar)
    { path: '', canActivate: [authGuard], 
        loadComponent: () => import('./shared/layout/shell/shell.component').then(m => m.ShellComponent), children:[
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'pacientes', loadComponent: () => import('./features/pacientes/lista/pacientes-lista/pacientes-lista.component').then(m => m.PacientesListaComponent) },
            { path: 'pacientes/novo', loadComponent: () => import('./features/pacientes/form/paciente-form/paciente-form.component').then(m => m.PacienteFormComponent) },
            { path: 'pacientes/:id/editar', loadComponent: () => import('./features/pacientes/form/paciente-form/paciente-form.component').then(m => m.PacienteFormComponent) },
        ]
    },

    // Qualquer rota não encontrada -> login
    { path: '**', redirectTo: 'login'},

];
