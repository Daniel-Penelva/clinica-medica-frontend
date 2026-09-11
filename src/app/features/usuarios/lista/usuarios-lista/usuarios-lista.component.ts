import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/auth/auth.service';
import { UsuarioResponse } from '../../../../core/models/usuario.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuarios-lista.component.html',
  styleUrl: './usuarios-lista.component.css',
})
export class UsuariosListaComponent {
  
  /**
   * Injeta as dependências necessárias para o componente, incluindo o serviço de usuários, roteador, 
   * diálogo e barra de notificação.
   * Além disso, injeta o serviço de autenticação para verificar o estado de login e o papel do usuário.
  */
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  protected authService = inject(AuthService);

  /**
   * Define as colunas da tabela de usuários, o dataSource para armazenar os dados dos usuários e
   * uma variável de controle de carregamento para indicar quando os dados estão sendo carregados.
  */
  colunas = ['nome', 'email', 'role', 'ativo', 'acoes'];
  dataSource = new MatTableDataSource<UsuarioResponse>([]);
  loading = false;

  /**
   * Inicializa o componente e carrega a lista de usuários chamando o método carregar().
  */
  ngOnInit(): void {
    this.carregar();
  }

  /**
   * Carrega a lista de usuários chamando o serviço de usuários e atualiza o dataSource com os dados recebidos.
   * Em caso de erro, exibe uma mensagem de erro usando a barra de notificação.
   * 
   * OBS. .data é uma propriedade do MatTableDataSource que armazena os dados da tabela.
  */
  carregar(): void {
    
    this.loading = true; // Indica que os dados estão sendo carregados

    this.usuarioService.listar().subscribe({
      next: (lista) => {
        this.dataSource.data = lista; // Atualiza o dataSource com a lista de usuários recebida do serviço.
        this.loading = false;
      }, error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar usuários', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Navega para a rota de cadastro de um novo usuário.
   * Este método é chamado quando o usuário clica no botão "Cadastrar" na interface.
  */
  novo(): void {
    this.router.navigate(['/usuarios/novo']); 
  }

  /**
   * Navega para a rota de edição de um usuário existente, passando o ID do usuário como parâmetro.
   * Este método é chamado quando o usuário clica no botão "Editar" na interface.
   * 
   * @param id O ID do usuário a ser editado.
  */
  editar(id: number): void {
    this.router.navigate(['/usuarios', id, 'editar']);
  }

  /**
   * Define um texto exibido para o usuário
   * Este método recebe um papel de usuário (role) como string e retorna o rótulo correspondente em português, um texto amigável para se 
   * apresentar na tela. Ele utiliza um objeto 'labels' para mapear os papéis de usuário para seus rótulos legíveis.
   * Se o papel fornecido não estiver definido no objeto 'labels', ele retorna o próprio papel como fallback.
  */
  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN':         'Administrador',
      'MEDICO':        'Medico',
      'RECEPCIONISTA': 'Recepcionista'
    };
    return labels[role] ?? role;  // Retorna o rótulo correspondente ao papel do usuário, ou o próprio papel se não houver rótulo definido.
  }

  /**
   * Define a classe CSS
   * Este método recebe um papel de usuário (role) como string e retorna a classe CSS correspondente 
   * para estilizar o elemento na interface. Ele utiliza um objeto 'classes' para mapear os papéis de usuário para suas classes CSS.
   * Se o papel fornecido não estiver definido no objeto 'classes', ele retorna uma string vazia como fallback.
  */
  getRoleClass(role: string): string {
    const classes: Record<string, string> = {
      'ADMIN':         'chip-admin',
      'MEDICO':        'chip-medico',
      'RECEPCIONISTA': 'chip-recep'
    };
    return classes[role] ?? ''; // Retorna a classe CSS correspondente ao papel do usuário, ou uma string vazia se não houver classe definida.
  }

 /**
 * Desativa um usuário após confirmação do administrador.
 *
 * Abre uma caixa de diálogo solicitando a confirmação da ação.
 * Caso o administrador confirme, chama o UsuarioService para realizar
 * a desativação lógica do usuário. Após a operação, exibe uma mensagem
 * de sucesso e recarrega a lista de usuários.
 *
 * Se ocorrer um erro, exibe a mensagem retornada pela API ou uma mensagem
 * padrão de erro.
 *
 * @param usuario Usuário que será desativado.
 */
  desativar(usuario: UsuarioResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Desativar Usuario',
        mensagem: `Deseja desativar o usuário ${usuario.nome}?`,
        textoBotaoConfirmar: 'Desativar',
        corBotao: 'warn'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      this.usuarioService.desativar(usuario.id).subscribe({
        next: () => {
          this.snackBar.open('Usuário desativado!', 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
          this.carregar();
        }, error: (err) => {
          const msg = err.error?.message ?? 'Erro ao desativar';
          this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
        }
      });
    });
  }

}
