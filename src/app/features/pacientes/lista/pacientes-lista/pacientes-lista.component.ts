import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { PacienteResponse } from '../../../../core/models/paciente.model';
import { PacienteService } from '../../../../core/services/paciente.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-pacientes-lista',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './pacientes-lista.component.html',
  styleUrl: './pacientes-lista.component.css',
})
export class PacientesListaComponent {
  
  /**
   * Injeção de dependências
  */
  private pacienteService = inject(PacienteService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  protected authService = inject(AuthService);

  /**
   * Colunas exibidas na tabela
   */
  colunas = ['nome', 'cpf', 'telefone', 'convenio', 'ativo', 'acoes'];

  /**
   * DataSource do Angular - para conectar a PacienteService com a mat-table
   */
  dataSource = new MatTableDataSource<PacienteResponse>([]);

  /**
   * Estado da paginação
   */
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  /**
   * Carregamento - para indicar quando a requisição está em andamento
   */
  loading = false;

  /**
   * Campo de busca com debounce - vai ser o input de busca vinculado ao formulário
   */
  buscaCtrl = new FormControl('');

  /**
     * Busca em tempo real com debounce
     * O uso do debounceTime é para esperar 400 ms após o usuário parar de digitar antes de carregar os dados.
     * O uso do distinctUntilChanged não dispara nada se o termo não mudar;
     * this.pageIndex sempre volta para página 0 (zero) e se houver busca é usado o buscarPorNome, senão lista padrão paginada
     * 
     * É utilizado o valueChanges de um FormControl que emite um valor e esse valor entra no subscribe como "termo" - por exemplo, esse termo pode 
     * ser string "João". É preciso tratar já que o valuesChange pode emitir null/undefined:
     * termo ?? '' 
     *   - Se termo não for null nem undefined -> usa o próprio termo (ex.: "joão").
     *   - Se termo for null ou undefined -> usa '' (string vazia).
    */
  ngOnInit(): void {
    this.carregarPacientes();

    this.buscaCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(termo => {
      this.pageIndex = 0; // volta para a primeira página
      this.carregarPacientes(termo ?? ''); // ?? Se termo for null ou undefined usa vazio
    });
  }

  /**
   * Chama o PacienteService com paginação para listar ou buscar por nome
   * Vai preencher o MatTableDataSource com page.content
   * Mostra loading e mensagem de erro se falhar
  */
  carregarPacientes(busca: string = ''): void {
    this.loading = true;
    const obs$ = busca.trim() ? this.pacienteService.buscarPorNome(busca, this.pageIndex, this.pageSize) : this.pacienteService.listar(this.pageIndex, this.pageSize);

    obs$.subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      }, error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar pacientes', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Atualiza paginação e recarrega a lista com o mesmo termo de busca, ou seja,
   * Se this.buscaCtrl.value não é null nem undefined -> usa o valor mesmo (ex.: "joão").
   * Se this.buscaCtrl.value é null ou undefined -> usa '' (string vazia).
   * 
   * Traduzindo em termos de paginação, quando o usuário muda de página, se houver um termo de busca, a lista é recarregada com esse termo. Se não
   * houver termo (campo vazio), a lista é recarregada sem busca, só com paginação. E isso é importante porque o onPageChange só deve atualizar a
   * página e o tamanho da página; e recarrega os dados com a mesma condição de busca (ou sem busca, se o campo estiver vazio).
   * Ao usar [this.buscaCtrl.value ?? ''] garante que sempre passe uma string para carregarPacientes. Evitando que null chegue lá e force 
   * a fazer if (busca == null) ... dentro de carregarPacientes.
   * O carregarPacientes continua com a mesma lógica:
   *  - Se busca.trim() tem valor -> usa buscarPorNome.
   *  - Se não -> usa listar (sem filtro).
  */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarPacientes(this.buscaCtrl.value ?? '');
  }

  /**
   * Ação de navegação para a tela de cadastro
  */
  novo(): void {
    this.router.navigate(['/pacientes/novo']);
  }

  /**
   * Ação de navegação para a tela de edição
  */
  editar(id: number): void {
    this.router.navigate(['/pacientes', id, 'editar']);
  }

  /**
   * Desativação do paciente que vai abrir uma mensagem de confirmação personalizada com o nome do paciente.
   * Se confirmar a desativação é chamado o pacienteService.desativar(paciente.id)
   * Depois mostra a msg de sucesso e recarrega a lista
  */
  desativar(paciente: PacienteResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { 
      width: '400px', 
      data: { 
        titulo: 'Desativar Paciente', 
        mensagem: `Deseja desativar o paciente ${paciente.nome}?`,
        textoBotaoConfirmar: 'Desativar',
        corBotao: 'warn'
        }
      });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.pacienteService.desativar(paciente.id).subscribe({
        next: () => {
          this.snackBar.open('Paciente Desativado!', 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
          this.carregarPacientes(this.buscaCtrl.value ?? '');
        }, error: (err) => {
          const msg = err.error?.message ?? 'Erro ao desativar';
          this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
        }
      });
    });
  }
}
