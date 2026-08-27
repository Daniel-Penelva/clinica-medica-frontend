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
            { path: 'medicos', loadComponent: () => import('./features/medicos/lista/medicos-lista/medicos-lista.component').then(m => m.MedicosListaComponent) },
            { path: 'medicos/novo', loadComponent: () => import('./features/medicos/form/medico-form/medico-form.component').then(m => m.MedicoFormComponent) },
            { path: 'medicos/:id/editar', loadComponent: () => import('./features/medicos/form/medico-form/medico-form.component').then(m => m.MedicoFormComponent) },
            { path: 'consultas', loadComponent: () => import('./features/consultas/lista/consultas-lista/consultas-lista.component').then(m => m.ConsultasListaComponent) },
            { path: 'consultas/nova', loadComponent: () => import('./features/consultas/form/consulta-form/consulta-form.component').then(m => m.ConsultaFormComponent) },
            { path: 'convenios', loadComponent: () => import('./features/convenios/lista/convenios-lista/convenios-lista.component').then(m => m.ConveniosListaComponent) },
            { path: 'convenios/novo', loadComponent: () => import('./features/convenios/form/convenio-form/convenio-form.component').then(m => m.ConvenioFormComponent) },
            { path: 'convenios/:id/editar', loadComponent: () => import('./features/convenios/form/convenio-form/convenio-form.component').then(m => m.ConvenioFormComponent) },
            { path: 'prontuarios/nova', loadComponent: () => import('./features/prontuarios/form/prontuario-form/prontuario-form.component').then(m => m.ProntuarioFormComponent) },
            { path: 'prontuarios/:id/editar', loadComponent: () => import('./features/prontuarios/form/prontuario-form/prontuario-form.component').then(m => m.ProntuarioFormComponent) },
            { path: 'prontuarios/consulta/:consultaId', loadComponent: () => import('./features/prontuarios/view/prontuario-view/prontuario-view.component').then(m => m.ProntuarioViewComponent) },
            { path: 'pacientes/:id/historico', loadComponent: () => import('./features/prontuarios/historico/historico-paciente/historico-paciente.component').then(m => m.HistoricoPacienteComponent) },
        ]
    },

    // Qualquer rota não encontrada -> login
    { path: '**', redirectTo: 'login'},

];
