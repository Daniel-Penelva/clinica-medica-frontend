import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  /**
   * Emite evento para o Shell abrir/fechar a sidebar
   * @Output permite que o Navbar (filho) envie eventos para o ShellComponent (pai)
   * EventEmitter<void>: emissor de eventos que não leva dados (só sinaliza "aconteceu algo").
   * Propósito: quando o usuário clica no botão do Navbar, ele "grita" para o pai (Shell) abrir/fechar a sidebar.
  */
  @Output() toggleSidenav = new EventEmitter<void>();

  /**
   * Injeção de dependências do serviço de autenticação AuthService e do serviço de navegação
   * Sintaxe mais limpa sem construtor
  */
  authService = inject(AuthService);
  router = inject(Router)

  /**
   * Chama emit no EventEmitter para notificar o pai (ShellComponent)
   * É chamado quando o usuário clica no botão de hambúrguer no HTML do Navbar
  */
  onToggle(): void {
    this.toggleSidenav.emit();
  }

  /**
   * Chama o método logout() do AuthService
   * Limpa tokens JWT do localStorage
   * Redireciona para /login
   * Fecha sessões ativas
  */
  onLogout(): void {
    this.authService.logout();
  }

}
