import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Adicionar imports para o registro do locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaResponse } from '../../../../core/models/consulta.model';
import { PacienteResponse } from '../../../../core/models/paciente.model';
import { PacienteService } from '../../../../core/services/paciente.service';
import { ProntuarioService } from '../../../../core/services/prontuario.service';

// Registrar o locale pt-BR para que as datas sejam exibidas no formato correto
registerLocaleData(localePt);

@Component({
  selector: 'app-historico-paciente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  providers: [
    {
      // Adicionar o provider para o LOCALE_ID com o valor 'pt-BR'
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
  ],
  templateUrl: './historico-paciente.component.html',
  styleUrl: './historico-paciente.component.css',
})
export class HistoricoPacienteComponent {

  /**
   * Injeção de dependências dos serviços necessários
   * ActivatedRoute: acesso aos parâmetros da rota (pacienteId)
   * Router: navegação entre páginas
   * ProntuarioService: comunicação com a API para buscar consultas realizadas
   * PacienteService: comunicação com a API para buscar dados do paciente
   */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prontuarioService = inject(ProntuarioService);
  private pacienteService = inject(PacienteService);

  /**
   * Variáveis de estado do componente
   * pacienteId: ID do paciente obtido da URL (pathParam)
   * paciente: armazena os dados do paciente carregado (null enquanto não carrega)
   * consultas: array de consultas realizadas do paciente (para exibição no histórico)
   * totalElements: total de consultas realizadas (para paginação)
   * pageSize: quantidade de itens por página (padrão: 10)
   * pageIndex: índice da página atual (0 = primeira página)
   * loading: indica se está carregando dados da API
   */
  pacienteId: number = 0;
  paciente: PacienteResponse | null = null;
  consultas: ConsultaResponse[] = [];
  totalElements = 0;
  pageSize      = 10;
  pageIndex     = 0;
  loading       = false;

  /**
   * Método chamado ao inicializar o componente
   * Obtém o pacienteId da URL (pathParam: /pacientes/:id/historico)
   * Busca dados do paciente via PacienteService.buscarPorId()
   * Chama carregar() para buscar histórico de consultas realizadas
   */
  ngOnInit(): void {
    
    // Obtém o parâmetro 'id' da rota e converte para número
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id')); 

    // Busca dados do paciente pelo ID
    this.pacienteService.buscarPorId(this.pacienteId).subscribe(
      p => this.paciente = p
    );
    this.carregar();
  }

  /**
   * Método para carregar histórico de consultas realizadas do paciente
   * Busca consultas via ProntuarioService.buscarConsultasRealizadasPorPaciente()
   * Parâmetros:
   *   - pacienteId: ID do paciente
   *   - pageIndex: página atual (0, 1, 2...)
   *   - pageSize: quantidade de itens por página (10, 25, 50...)
   * Filtra apenas consultas com status 'REALIZADA' no frontend
   * Atualiza array de consultas e total de elementos para paginação
  */
  carregar(): void {
    this.loading = true;
    this.prontuarioService.buscarConusltasRealizadasPorPaciente(this.pacienteId, this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        // Filtra apenas consultas realizadas
        this.consultas = page.content.filter(c => c.status === 'REALIZADA');
        this.totalElements = page.totalElements;
        this.loading = false;
      }, error: () => { this.loading = false; }
    });
  }

  /**
   * Método chamado ao mudar página no paginator
   * Atualiza pageIndex e pageSize com novos valores do evento
   * Chama carregar() para buscar nova página de consultas
   * 
   * @param event - Evento do mat-paginator com pageIndex e pageSize
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex; // Atualiza índice da página atual
    this.pageSize  = event.pageSize; // Atualiza quantidade de itens por página
    this.carregar(); // Recarrega consultas com nova paginação
  }

  /**
   * Método para navegar para página de visualização de prontuário
   * Usado quando usuário clica em "Ver prontuário" em consulta realizada
   * Navega para /prontuarios/consulta/{consultaId}
   * 
   * @param consultaId - ID da consulta para visualizar prontuário
   */
  verProntuario(consultaId: number): void {
    this.router.navigate(['/prontuarios/consulta', consultaId]);
  }

  /**
   * Método para navegar para página de criação de prontuário
   * Usado quando usuário clica em "Criar prontuário" em consulta realizada sem prontuário
   * Navega para /prontuarios/nova com queryParam { consultaId }
   * 
   * @param consultaId - ID da consulta para criar prontuário
   */
  criarProntuario(consultaId: number): void {
    this.router.navigate(['/prontuarios/nova'], { queryParams: { consultaId } });
  }

  /**
   * Método para voltar à lista de pacientes
   * Usado no botão "Voltar" da tela de histórico
   * Navega para /pacientes sem salvar alterações
   */
  voltar(): void { 
    this.router.navigate(['/pacientes']); 
  }
}
