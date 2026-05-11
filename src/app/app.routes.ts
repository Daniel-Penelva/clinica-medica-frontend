import { Routes } from '@angular/router';

export const routes: Routes = [

    // Redireciona raiz para login por enquanto
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Rota não encontrada
    { path: '**', redirectTo: 'login'},

];
