import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatSidenav,
    NavbarComponent,
    SidebarComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {

  /** 
   * Referência ao Sidenav para abrir/fechar via Navbar
   * @ViewChild é um decorador que permite acessar elementos do template HTML diretamente no TypeScript.
   * 'sidenav' é o template reference - corresponde ao #sidenav no HTML do componente. 
   * No HTML vai ter algo assim:
   * <mat-sidenav #sidenav> ... </mat-sidenav>
   * 
   * sidenav!: MatSidenav
   * sidenav é o nome da propriedade no componente (usa como this.sidenav)
   * MatSidenav é o tipo: diz que sidenav é um componente do Angular Material (menu lateral).
   * ! é o non-null assertion operator - garante que sidenav não vai ser nulo (null) ou indefinido (undefined)
   * */
  @ViewChild('sidenav') sidenav!: MatSidenav;

  /**
   * Alterna o estado do menu lateral
   * 
   * Vou chamar a referência 'this.sidenav' e utilizar o método nativo toggle() para que:
   *    - Se o menu está fechado -> abre o menu.
   *    - Se o menu está aberto -> fecha o menu.
   *    - É como um interruptor: sempre inverte o estado atual.
  */
  toggleSidenav(): void {
    this.sidenav.toggle();
  }

}
