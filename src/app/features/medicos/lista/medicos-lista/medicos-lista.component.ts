import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { MedicoResponse } from '../../../../core/models/medico.model';
import { MedicoService } from '../../../../core/services/medico.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-medicos-lista',
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
  templateUrl: './medicos-lista.component.html',
  styleUrl: './medicos-lista.component.css',
})
export class MedicosListaComponent {
  // Injeção de dependências
  private medicoService = inject(MedicoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  protected authService = inject(AuthService);

  /**
   * Variáveis para controle da tabela, paginação, carregamento e busca (utiliza o FormControl para vincular a um campo de entrada na interface,
   * permitindo que o usuário digite uma string de busca para filtrar os médicos por nome).
   * MatTableDataSource é a estrutura de dados usada pelo Angular Material para tabelas para facilitar a integração com recursos como paginação, ordenação e filtragem.
   */
  colunas = ['nome', 'crm', 'telefone', 'especialidades', 'ativo', 'acoes'];
  dataSource = new MatTableDataSource<MedicoResponse>([]);
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  buscaCtrl = new FormControl('');

  /**
   * No método ngOnInit, o componente é inicializado carregando a lista de médicos chamando o método carregar().
   * Além disso, é configurado um listener para mudanças no campo de busca (buscaCtrl). Usando os operadores debounceTime 
   * e distinctUntilChanged do RxJS, o componente aguarda 400 milissegundos após a última digitação do usuário e só emite 
   * um novo valor se ele for diferente do anterior. Quando um novo termo de busca é emitido, o método carregar é chamado 
   * novamente para atualizar a lista de médicos com base no termo de busca fornecido, e a paginação é resetada para a 
   * primeira página (pageIndex = 0) para garantir que os resultados da busca sejam exibidos desde o início.
  */
  ngOnInit(): void {
    this.carregar();
    this.buscaCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(termo => {
      this.pageIndex = 0;
      this.carregar(termo ?? '');
    });
  }

  /**
   * Método para carregar os médicos do backend, com suporte para busca por nome.
   * Ele é chamado inicialmente no ngOnInit para carregar os dados quando o componente é inicializado, e
   * também pode ser chamado quando o usuário realiza uma busca, passando a string de busca como argumento.
  */
  carregar(busca: string = ''): void {
    /**
     * Indica que os dados estão sendo carregados, vai ser mostrado um spinner de carregamento
     * na interface enquanto os dados estão sendo buscados do backend.
     */
    this.loading = true;

    /**
     * Se a string de busca não for vazia (após remover espaços em branco), chama o método buscarPorNome do serviço
     * para buscar médicos que correspondam ao nome fornecido. Caso contrário, chama o método listar para obter a 
     * lista completa de médicos. O resultado é um Observable que emitirá a resposta do backend, que será usada para 
     * atualizar a tabela de médicos na interface.
    */
    const obs$ = busca.trim()
      ? this.medicoService.buscarPorNome(busca, this.pageIndex, this.pageSize)
      : this.medicoService.listar(this.pageIndex, this.pageSize);

    /**
     * Assina o Observable para receber os dados do backend. No caso de sucesso, atualiza a dataSource da tabela com os médicos recebidos,
     * atualiza o total de elementos para controle da paginação e desativa o indicador de carregamento. No caso de erro, desativa o indicador de 
     * carregamento e exibe uma mensagem de erro usando o MatSnackBar, informando o usuário que houve um problema ao carregar os médicos.
    */
    obs$.subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      }, error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar médicos', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Método para lidar com mudanças na paginação. Ele é chamado quando o usuário interage com o componente de paginação (MatPaginator) 
   * para mudar a página ou número de itens por página. O método recebe um evento do tipo pageEvent, que contém informações sobre a 
   * nova página e o novo tamanho da página. Ele atualiza as variáveis pageIndex e pageSize com os novos valores e chama o método carregar
   * para recarregar os dados da tabela com base na nova página e tamanho, mantendo a string de busca atual para filtrar os resultados 
   * conforme necessário.
  */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregar(this.buscaCtrl.value ?? '');
  }

  /**
   * Método para navegar para a página de cadastro de um novo médico. 
   * Ele é chamado quando o usuário clica em um botão para adicionar um novo médico.
  */
  novo(): void {
    this.router.navigate(['/medicos/novo']); 
  }

  /**
   * Método para navegar para a página de edição de um método existente.
   * Ele é chamado quando o usuário clica em um botão de edição associado a um médico específico na tabela.
   * O método recebe o ID do médico a ser editado como argumento e usa o Router para navegar para a rota de edição correspondente,
   * passando o ID do médico na URL para que a página de edição possa carregar os dados do médico específico para edição.
  */
  editar(id: number): void { 
      this.router.navigate(['/medicos', id, 'editar']); 
  }

  /**
   * Método para desativar um médico. Ele é chamado quando o usuário clica em um botão de desativação associado a um médico específico na tabela.
   * O método recebe o objeto MedicoResponse do médico a ser desativado como argumento.
  */
  desativar(medico: MedicoResponse): void {

    /**
     * Abre um diálogo de confirmação usando o MatDialog para confirmar a ação de desativar um médico.
    */
    const ref = this.dialog.open(ConfirmDialogComponent, { 
      width: '400px', 
      data: {
        titulo: 'Desativar Medico', 
        mensagem: `Deseja desativar o médico ${medico.nome}`, 
        textoBotaoConfirmar: 'Desativar', 
        corBotao: 'warn' 
      } 
    });

    /**
     * Após o diálogo ser fechado, verifica se a ação foi confirmada pelo usuário. Se confirmado, chama o método desativar do serviço de médico
     * para desativar o médico no backend. Se a desativação for bem-sucedida, exibe uma mensagem de sucesso usando o MatSnackBar e recarrega a 
     * lista de médicos para refletir a mudança. Se ocorrer um erro durante a desativação, exibe uma mensagem de erro.
    */
    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.medicoService.desativar(medico.id).subscribe({
        next: () => {
          this.snackBar.open('Médico desativado!', 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
          this.carregar(this.buscaCtrl.value ?? '');
        }, error: (err) => {
          const msg = err.error?.message ?? 'Erro ao desativar médico';
          this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
        }
      });
    });
  }

}
