import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Interface MenuItem
 * É um modelo para cada item do menu.
 * roles é opcional - se não tiver, aparece para todos.
 * Se tiver roles, só aparece para usuários com permissão.
*/
interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[]; // se definido, so aparece para esses roles
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  
  /**
   * Injeção de dependência do serviço de autenticação AuthService 
   * Vai ser utilizado para verificar o 'currentRole()' do usuário logado. */  
  authService = inject(AuthService);

  /**
   * Arrays de dados fixos
   * Lista completa dos itens do menu com ícones do Material
  */
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Pacientes', icon: 'people', route: '/pacientes' },
    {
      label: 'Medicos',
      icon: 'medical_services',
      route: '/medicos',
      roles: ['ADMIN'],
    },
    { label: 'Consultas', icon: 'event_note', route: '/consultas' },
    {
      label: 'Relatorios',
      icon: 'bar_chart',
      route: '/relatorios',
      roles: ['ADMIN'],
    },
  ];

  /**
   * Getter itensVisiveis (filtro por role)
   * Lógica de autorização:
   *  1. Se item.roles é undefined -> mostra para todos
   *  2. Se tem roles -> verifica se currentRole() está na lista.
   *  3. Retorna apenas os itens permitidos para o usuário atual.
   * Por exemplo: 
   *  - Usuário ADMIN -> vê tudo
   *  - Usuário MEDICO -> só Dashboard + Pacientes + Consultas
  */
  get itensVisiveis(): MenuItem[] {
    return this.menuItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(this.authService.currentRole());
    });
  }
}
