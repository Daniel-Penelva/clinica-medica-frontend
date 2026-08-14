import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConvenioService } from '../../../../core/services/convenio.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConvenioResponse } from '../../../../core/models/convenio.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-convenios-lista',
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
  templateUrl: './convenios-lista.component.html',
  styleUrl: './convenios-lista.component.css',
})
export class ConveniosListaComponent {

  // Injeção de dependências usando o método inject() do Angular
  private convenioService = inject(ConvenioService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  /**
   * Definindo as colunas da tabela 
   * Inicializando o dataSource com um array vazio
   * Variável para controlar o estado de carregamento
  */
  colunas = ['nome', 'registro', 'ativo', 'acoes'];
  dataSource = new MatTableDataSource<ConvenioResponse>([]); 
  loading = false;

  // Inicializar o componente e carregar os dados
  ngOnInit(): void {
    this.carregar();
  }

  /**
   * Método para carregar os dados da tabela
   * (OBS. .data é uma propriedade do MatTableDataSource que armazena os dados a serem exibidos na tabela)
  */
  carregar(): void {
    this.loading = true;
    this.convenioService.listar().subscribe({
      next: (lista) => {
        this.dataSource.data = lista;
        this.loading = false;
      }, error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar convenios', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  // Método para navegar para a página de cadastro de um novo convênio
  novo(): void {
    this.router.navigate(['/convenios/novo']); 
  }

  /***
   * Método para navegar para a página de edição de um convênio existente.
   * (OBS. 'editar' é o caminho definido na rota para a página de edição)
   * */  
  editar(id: number): void {
    this.router.navigate(['/convenios', id, 'editar']); 
  }

  /**
   * Método para desativar um convênio existente.
   * (OBS. O método abre um diálogo de confirmação antes de desativar o convênio)
   * (OBS. afterClosed() é um método do MatDialog que retorna um Observable que emite o valor passado para o método close() do 
   * diálogo quando ele é fechado. Neste caso, o valor emitido é um booleano que indica se o usuário confirmou ou não a ação de 
   * desativar o convênio. Se o usuário confirmar, o método desativar() do ConvenioService é chamado para desativar o convênio no backend)
  */
  desativar(convenio: ConvenioResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Desativar Convenio',
        mensagem: `Deseja desativar o convenio ${convenio.nome}?`,
        textoBotaoConfirmar: 'Desativar',
        corBotao: 'warn'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      this.convenioService.desativar(convenio.id).subscribe({
        next: () => {
          this.snackBar.open('Convenio desativado!', 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
          this.carregar();
        }, error: (err) => {
          const msg = err.error?.message ?? 'Erro ao desativar';
          this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
        }
      });
    });
  }
}
