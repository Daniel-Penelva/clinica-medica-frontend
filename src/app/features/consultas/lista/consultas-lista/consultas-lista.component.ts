import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConsultaService } from '../../../../core/services/consulta.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/auth/auth.service';
import { CancelamentoRequest, ConsultaRequest, ConsultaResponse } from '../../../../core/models/consulta.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

// Adicionar imports para o registro do locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

// Registrar o locale pt-BR para que as datas sejam exibidas no formato correto
registerLocaleData(localePt);

@Component({
  selector: 'app-consultas-lista',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [ // Adicionar o provider para o LOCALE_ID com o valor 'pt-BR'
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  templateUrl: './consultas-lista.component.html',
  styleUrl: './consultas-lista.component.css',
})
export class ConsultasListaComponent {
  // Injeção de dependências
  private consultaService = inject(ConsultaService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  protected authService = inject(AuthService);

  /**
   * Colunas da tabela de consultas
   * Objeto MatTableDataSource para armazenar os dados da tabela
   * Total de elementos
   * Tamanho da página
   * Índice da página
   * Flag de carregamento para exibir o spinner de carregamento
   */
  colunas = ['dataHora', 'paciente', 'medico', 'status', 'acoes'];
  dataSource = new MatTableDataSource<ConsultaResponse>([]);
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  /**
   * Método para iniciar o carregamento */ 
  ngOnInit(): void {
    this.carregar();
  }

  /**
   * Método para carregar as consultas da API
   * Utiliza o serviço ConsultaService para listar as consultas
   * Atualiza o MatTableDataSource com os dados recebidos
   * Atualiza o total de elementos e a flag de carregamento
   * Em caso de erro, exibe uma mensagem de erro utilizando o MatSnackBar
   * 
   * OBS. .data é uma propriedade do MatTableDataSource que armazena os dados da tabela.
  */
  carregar(): void {
    this.loading = true;
    this.consultaService.listar(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar consultas', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Método para lidar com a mudança de página do paginator
   * Atualiza o índice da página e o tamanho da página
   * Chama o método carregar() para atualizar os dados da tabela
  */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregar();
  }

  /**
   * Método para navegar para a página de nova consulta
  */
  novaConsulta(): void {
    this.router.navigate(['/consultas/nova']);
  }

  /**
   * Método para obter a classe CSS correspondente ao status da consulta
   * Utiliza um Record para mapear os status para as classes CSS
   * Retorna a classe CSS correspondente ao status ou uma string vazia caso o status não seja reconhecido
   * 
   * @param status - O status da consulta
   * @return A classe CSS correspondente ao status da consulta
  */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'AGENDADA': 'chip-agendada',
      'CONFIRMADA': 'chip-confirmada',
      'REALIZADA': 'chip-realizada',
      'CANCELADA': 'chip-cancelada',
      'NAO_COMPARECEU': 'chip-nao-compareceu'
    };
    return classes[status] ?? '';
  }

  /**
   * Método para obter o rótulo correspondente ao status da consulta
   * Utiliza um Record para mapear os status para os rótulos
   * Retorna o rótulo correspondente ao status ou o próprio status caso não seja reconhecido
   * 
   * @param status - O status da consulta
   * @return O rótulo correspondente ao status da consulta
  */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'AGENDADA': 'Agendada',
      'CONFIRMADA': 'Confirmada',
      'REALIZADA': 'Realizada',
      'CANCELADA': 'Cancelada',
      'NAO_COMPARECEU': 'Nao compareceu'
    };
    return labels[status] ?? status;
  }

  /**
   * Método para confirmar a presença de uma consulta
   * Chama o serviço ConsultaService para confirmar a consulta
   * Em caso de sucesso, exibe uma mensagem de sucesso e recarrega a lista de consultas
   * Em caso de erro, exibe uma mensagem de erro
   * 
   * @param consulta - A consulta a ser confirmada
  */
  confirmar(consulta: ConsultaResponse): void {
    this.consultaService.confirmar(consulta.id).subscribe({
      next: () => {
        this.snackBar.open('Presenca confirmada!', 'Fechar', { duration: 2000, panelClass: ['snack-success'] });
        this.carregar();
      }, error: (err) => this.mostrarErro(err)
    });
  }

  /**
   * Método para cancelar uma consulta
   * Abre um diálogo de confirmação utilizando o MatDialog
   * Caso o usuário confirme, chama o serviço ConsultaService para cancelar a consulta
   * Em caso de sucesso, exibe uma mensagem de sucesso e recarrega a lista de consultas
   * Em caso de erro, exibe uma mensagem de erro
   * 
   * OBS. .afterClosed() é um método do MatDialog que retorna um Observable que emite o valor passado para o método close()
   * do diálogo quando ele é fechado. Neste caso, o valor emitido é um booleano indicando se o usuário confirmou ou não a ação.
   * 
   * @param consulta - A consulta a ser cancelada
  */
  cancelar(consulta: ConsultaResponse): void {
    const ref =  this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        titulo: 'Cancelar Consulta',
        mensagem: `Deseja cancelar a consulta de ${consulta.nomePaciente}?`,
        textoBotaoConfirmar: 'Cancelar Consulta',
        corBotao: 'warn'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      const request: CancelamentoRequest = {
        motivo: 'Cancelamento pela recepcao'
      };
      this.consultaService.cancelar(consulta.id, request).subscribe({
        next: () => {
          this.snackBar.open('Consulta cancelada!', 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
          this.carregar();
        }, error: (err) => this.mostrarErro(err)
      });
    });
  }

  /**
   * Método para marcar uma consulta como realizada
   * Chama o serviço ConsultaService para marcar a consulta como realizada
   * Em caso de sucesso, exibe uma mensagem de sucesso e recarrega a lista de consultas
   * Em caso de erro, exibe, uma mensagem de erro
   * 
   * @param consulta - A consulta a ser marcada como realizada
  */
  realizar(consulta: ConsultaResponse): void {
    this.consultaService.realizar(consulta.id).subscribe({
      next: () => {
        this.snackBar.open('Consulta marcada como realizada!', 'Fechar', { duration: 2000, panelClass: ['snack-success'] });
        this.carregar();
      }, error: (err) => this.mostrarErro(err)
    });
  }

  /**
   * Método para registrar que o paciente não compareceu à consulta
   * Chama o service ConsultaService para registrar a ausência do paciente
   * Em caso de sucesso, exibe uma mensagem de sucesso e recarrega a lista de consultas
   * Em caso de erro, exibe uma mensagem de erro
   * 
   * @param consulta - A consulta para a qual o paciente não compareceu
  */
  naoCompareceu(consulta: ConsultaResponse): void {
    this.consultaService.naoCompareceu(consulta.id).subscribe({
      next: () => {
        this.snackBar.open('Registrado: nao compareceu', 'Fechar', { duration: 2000, panelClass: ['snack-success'] });
        this.carregar();
      },
      error: (err) => this.mostrarErro(err)
    });
  }

  /**
   * Método para mostrar uma mensagem de erro utilizando o MatSnackBar
   * Obtém a mensagem de erro do objeto de erro recebido ou utiliza uma mensagem padrão caso não exista.
   * 
   * @param err - O objeto de erro recebido da requisição
  */
  private mostrarErro(err: any): void {
    const msg = err.error?.message ?? 'Erro ao processar acao';
    this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
  }

}
