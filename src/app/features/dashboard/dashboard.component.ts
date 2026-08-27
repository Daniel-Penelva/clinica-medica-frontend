import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { ConsultaHoje, ConsultasPorEspecialidade, ConsultasPorMes, DashboardResumo } from '../../core/models/dashboard.model';
import { forkJoin } from 'rxjs';

// Adicionar imports para o registro do locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

// Registrar o locale pt-BR para que as datas sejam exibidas no formato correto
registerLocaleData(localePt);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
  ],
  providers: [
    {
      // Adicionar o provider para o LOCALE_ID com o valor 'pt-BR'
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {

  // Injetar os serviços necessários usando o método inject()
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  loading = true; // Indica se os dados estão sendo carregados

  /**
   * Variáveis para armazenar os dados do dashboard.
   * Inicialmente são definidas como null ou arrays vazios, e serão preenchidas com os dados obtidos 
   * do serviço DashboardService quando o componente for inicializado.
   * 
   * - resumo: Armazena o resumo do dashboard, incluindo totais de pacientes, médicos e consultas.
   * - consultasHoje: Armazena a lista de consultas agendadas para o dia atual.
   * - proximas: Armazena a lista de próximas consultas agendadas.
   * - porMes: Armazena a lista de consultas agrupadas por mês.
   * - porEspecialidade: Armazena a lista de consultas agrupadas por especialidade.
  */
  resumo: DashboardResumo | null = null; 
  consultasHoje: ConsultaHoje[] = [];
  proximas: ConsultaHoje[] = [];
  porMes: ConsultasPorMes[] = [];
  porEspecialidade: ConsultasPorEspecialidade[] = [];

  // Colunas da tabela de consultas agendadas para o dia atual
  colunaAgenda = ['horario', 'paciente', 'medico', 'status'];

  /**
   * Método chamado quando o componente é inicializado.
   * 
   * Este método utiliza o forkJoin do RxJS para disparar múltiplas requisições HTTP simultaneamente e aguarda que todas sejam concluídas 
   * antes de atualizar a interface do usuário.
   * As requisições atualizadas sao:
   * - resumo: Obtém o resumo do dashboard.
   * - consultasHoje: Obtém a lista de consultas agendadas para o dia atual.
   * - proximas: Obtém a lista de próximas consultas agendadas.
   * - porMes: Obtém a lista de consultas agrupadas por mês.
   * - porEspecialidade: Obtém a lista de consultas agrupadas por especialidade.
   * 
   * Quando todas as requisições são concluídas com sucesso, os dados são armazenados nas variáveis correspondentes e 
   * o indicador de carregamento é definido como false. Caso ocorra algum erro durante as requisições, o indicador de carregamento também é 
   * definido como false.
   * 
  */
  ngOnInit(): void {
    
    // forkJoin: dispara todas as requisições simultaneamente e só atualiza a tela quando todas terminarem.
    forkJoin({
      resumo: this.dashboardService.getResumo(),
      consultasHoje: this.dashboardService.getConsultasHoje(),
      proximas: this.dashboardService.getProximas(),
      porMes: this.dashboardService.getPorMes(),
      porEspecialidade: this.dashboardService.getPorEspecialidade(),
    }).subscribe({
      next: (dados) => {
        this.resumo  = dados.resumo;
        this.consultasHoje = dados.consultasHoje;
        this.proximas = dados.proximas;
        this.porMes = dados.porMes;
        this.porEspecialidade = dados.porEspecialidade;
        
        this.loading = false;
      }, error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Método para obter a classe CSS correspondente ao status de uma consulta.
   * 
   * Este método utiliza um objeto de mapeamento para associar cada status de consulta a uma classe CSS específica.
   * Caso o status não seja encontrado no mapeamento, uma string vazia é retornada.
   * 
   * @param status O status da consulta (AGENDADA, CONFIRMADA, REALIZADA, CANCELADA, NAO_COMPARECEU).
   * @return A classe CSS correspondente ao status da consuta.
  */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'AGENDADA':       'chip-agendada',
      'CONFIRMADA':     'chip-confirmada',
      'REALIZADA':      'chip-realizada',
      'CANCELADA':      'chip-cancelada',
      'NAO_COMPARECEU': 'chip-nao-compareceu'
    };
    return classes[status] ?? '';
  }

  /**
   * Método para obter o rótulo legível correspondente ao status de uma consulta.
   * 
   * Este método utiliza um objeto de mapeamento para associar cada status de consulta a um rótulo legível.
   * Caso o status não seja encontrado no mapeamento, o próprio status é retornado.
   * 
   * @param status O status da consulta (AGENDADA, CONFIRMADA, REALIZADA, CANCELADA, NAO_COMPARECEU).
   * @return O rótulo legível correspondente ao status da consulta.
  */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'AGENDADA':       'Agendada',
      'CONFIRMADA':     'Confirmada',
      'REALIZADA':      'Realizada',
      'CANCELADA':      'Cancelada',
      'NAO_COMPARECEU': 'Nao compareceu'
    };
    return labels[status] ?? status;
  }

  // Método para navegar para a página de consultas.
  irParaConsultas(): void {
    this.router.navigate(['/consultas']);
  }
}
