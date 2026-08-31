import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

// Adicionar imports para o registro do locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

// Importa as bibliotecas de PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { DashboardService } from '../../core/services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConsultasPorEspecialidade, ConsultasPorMes } from '../../core/models/dashboard.model';
import { forkJoin } from 'rxjs';


// Registrar o locale pt-BR para que as datas sejam exibidas no formato correto
registerLocaleData(localePt);

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  providers: [
    {
      // Adicionar o provider para o LOCALE_ID com o valor 'pt-BR'
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
    { 
      provide: MAT_DATE_LOCALE, 
      useValue: 'pt-BR' 
    },
  ],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.css',
})
export class RelatoriosComponent {

  /**
   * Referências aos elementos HTML para captura do PDF
   * tabelaMes: referência à tabela de consultas por mês
   * tabelaEsp: referência à tabela de consultas por especialidade
   * tabelaStatus: referência à tabela de consultas por status
   * Usados pelo método exportarPDF() para gerar os arquivos
   */
  @ViewChild('tabelaMes') tabelaMes!: ElementRef;
  @ViewChild('tabelaEspecialidade') tabelaEsp!: ElementRef;
  @ViewChild('tabelaStatus') tabelaStatus!: ElementRef;

  /**
   * Injeção de dependências dos serviços necessários
   * FormBuilder: criação de formulários (se necessário)
   * DashboardService: comunicação com a API para buscar dados dos relatórios
   * MatSnackBar: feedback visual (mensagens de sucesso/erro)
   */
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);
  private snackBar = inject(MatSnackBar);

  /**
   * Variáveis de estado do componente
   * loading: indica se está carregando dados da API
   * exportando: indica se está exportando PDF (evita múltiplos cliques)
   * carregado: true após primeira busca (controle de carregamento inicial)
   */
  loading = false;
  exportando = false;
  carregado = false; // true após primeira busca

  /**
   * Dados dos relatórios carregados da API
   * dadosPorMes: array de consultas agrupadas por mês
   * dadosPorEsp: array de consultas agrupadas por especialidade
   * dadosPorStatus: objeto com contagem de consultas por status
   */
  dadosPorMes: ConsultasPorMes[] = [];
  dadosPorEsp: ConsultasPorEspecialidade[] = [];
  dadosPorStatus: any = null;

  /**
   * DataSources para as tabelas do Angular Material
   * dsMes: armazena dados da tabela de consultas por mês
   * dsEsp: armazena dados da tabela de consultas por especialidade
   */
  dsMes = new MatTableDataSource<ConsultasPorMes>([]);
  dsEsp = new MatTableDataSource<ConsultasPorEspecialidade>([]);

  /**
   * Colunas das tabelas do Angular Material
   * colMes: colunas da tabela por mês (mês, total)
   * colEsp: colunas da tabela por especialidade (especialidade, total, percentual)
   * colStatus: colunas da tabela por status (status, quantidade)
   */
  colMes = ['mes', 'total'];
  colEsp = ['especialidade', 'total', 'percentual'];
  colStatus = ['status', 'quantidade'];

  /**
   * Dados de status formatados para exibição na tabela
   * Array de objetos com status (string) e quantidade (number)
   * Preenchido no método buscarDados() a partir dos dados da API
   */
  statusRows: { status: String, quantidade: number } [] = [];

  /**
   * Getter para calcular total geral de consultas
   * Soma todos os campos 'total' do array dadosPorMes
   * Usado para exibir totalizador no relatório
   * 
   * @return Total de consultas somadas de todos os meses
   */
  get totalConsultas(): number {
    return this.dadosPorMes.reduce(
      (acc, m) => acc + m.total, 0
    );
  }

  /**
   * Getter para obter mês com mais consultas
   * Retorna o objeto ConsultasPorMes com maior valor de 'total'
   * Usado para exibir destaque no relatório
   * 
   * @return Objeto do mês com mais consultas ou null se array vazio
   */
  get mesComMaisConsultas(): ConsultasPorMes | null {
    if (!this.dadosPorMes.length) return null;
    return this.dadosPorMes.reduce(
      (max, m) => m.total > max.total ? m : max,
      this.dadosPorMes[0]
    );
  }

  /**
   * Getter para obter especialidade com mais consultas
   * Retorna primeiro elemento do array (já vem ordenado DESC do backend)
   * Usado para exibir destaque no relatório
   * 
   * @return Objeto da especialidade top ou null se array vazio
   */
  get especialidadeTop(): ConsultasPorEspecialidade | null {
    if (!this.dadosPorEsp.length) return null;
    return this.dadosPorEsp[0]; // já vem ordenado desc do backend
  }

  /**
   * Método chamado ao inicializar o componente
   * Chama buscarDados() para carregar todos os relatórios
   */
  ngOnInit(): void {
    this.buscarDados();
  }

  /**
   * Método para buscar dados dos relatórios da API
   * Usa forkJoin para disparar 3 requisições simultâneas:
   *   - getPorMes(): consultas agrupadas por mês
   *   - getPorEsp(): consultas agrupadas por especialidade
   *   - getPorStatus(): consultas agrupadas por status
   * Atualiza DataSources das tabelas e formata dados de status
   * Exibe feedback visual em caso de erro
   */
  buscarDados(): void {
    this.loading = true;

    forkJoin({
      porMes:    this.dashboardService.getPorMes(),
      porEsp:    this.dashboardService.getPorEspecialidade(),
      porStatus: this.dashboardService.getPorStatus(),
    }).subscribe({
      next: (dados) => {
        console.log('Dados recebidos:', dados); // verificar 

        // Armazena dados brutos dos relatórios
        this.dadosPorMes = dados.porMes;
        this.dadosPorEsp = dados.porEsp;

        // Atualiza DataSources das tabelas do Angular Material
        this.dsMes.data = dados.porMes;
        this.dsEsp.data = dados.porEsp;

        // Formata os dados de status para a tabela
        // Mapeia campos do backend para labels amigáveis
        this.statusRows = [
          { status: 'Agendadas',       quantidade: dados.porStatus.agendadas },
          { status: 'Confirmadas',     quantidade: dados.porStatus.confirmadas },
          { status: 'Realizadas',      quantidade: dados.porStatus.realizadas },
          { status: 'Canceladas',      quantidade: dados.porStatus.canceladas },
          { status: 'Nao compareceu',  quantidade: dados.porStatus.naoCompareceu }, 
        ];

        this.loading = false;
        this.carregado = true;
      
      }, error: (err) => {
        console.error('Erro:', err);
        // Trata erro ao carregar relatórios
        this.loading = false;
        this.snackBar.open('Erro ao carregar relatorios', 'Fechar',{ duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  // ------------ EXPORTAR PDF -------------------------------------------------------------------

  /**
   * Exporta uma tabela específica como PDF.
   * Captura elemento HTML como imagem e insere em documento PDF
   * Função assincrona (async) que retorna uma Promise.
   * 
   * @param elemento - Referência ao ElementRef da tabela (@ViewChild)
   * @param nomeArquivo - Nome do arquivo PDF gerado (sem extensão)
   * @param titulo - Título que aparece no cabeçalho do PDF
   * @return Promise<void>
   */
  async exportarPDF(elemento: ElementRef, nomeArquivo: string, titulo: String): Promise<void> {
    this.exportando = true;

    try {

      /**
       * 1. Captura o elemento HTML como imagem (canvas)
       * 
       * scale: 2 - resolucao 2x para melhor qualidade
       * backgrundColor - fundo branco
       * useCORS - permite imagens de dominios externos
      */
      const canvas = await html2canvas(elemento.nativeElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true });

      // 2. Coverte o canvas em imagem base64 (PNG)
      const imgData = canvas.toDataURL('image/png');

      // 3. Cria o documento PDF em formato A4 horizontal (landscape para tabelas largas)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 4. Configuracoes de layout do PDF
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin    = 10;  // margem de 10mm

      // 5. Adiciona cabeçalho ao PDF
      pdf.setFontSize(16);
      pdf.setTextColor(26, 60, 94);  // cor azul escuro (#1A3C5E)
      pdf.text('Clinica Medica - ' + titulo, margin, margin + 6);

      /**
       * Data de geração do relatório
       * Formato: dd/MM/yyyy HH:mm (pt-BR)
       *  */ 
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const dataGeracao = new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      pdf.text('Gerado em: ' + dataGeracao, margin, margin + 12);

      // 6. Calcula o tamanho da imagem para caber no PDF
      const imgWidth  = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const posY      = margin + 18;  // abaixo do cabecalho

      // 7. Adiciona a imagem da tabela no PDF
      pdf.addImage(imgData, 'PNG', margin, posY, imgWidth, imgHeight);

      // 8. Rodape com numero de pagina
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Pagina 1 de 1', pdfWidth / 2, pdfHeight - 5, { align: 'center' });

      // 9. Faz o download do PDF
      pdf.save(nomeArquivo + '.pdf');

      this.snackBar.open('PDF exportado com sucesso!', 'Fechar', { duration: 3000, panelClass: ['snack-success'] });

    } catch (error) {
      this.snackBar.open('Erro ao exportar PDF', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
    } finally {
      this.exportando = false;
    }
  }

  /**
   * Método para exportar relatório de consultas por mês como PDF
   * Chama exportarPDF() com referência à tabelaMes
   */
  exportarPorMes(): void {
    this.exportarPDF(this.tabelaMes, 'clinica-relatorio-consultas-por-mes', 'Relatorio de Consultas por Mes');
  }

  /**
   * Método para exportar relatório de consultas por especialidade como PDF
   * Chama exportarPDF() com referência à tabelaEsp
   */
  exportarPorEspecialidade(): void {
    this.exportarPDF(this.tabelaEsp, 'clinica-relatorio-por-especialidade', 'Relatorio de Consultas por Especialidade');
  }

  /**
   * Método para exportar relatório de consultas por status como PDF
   * Chama exportarPDF() com referência à tabelaStatus
   */
  exportarPorStatus(): void {
    this.exportarPDF(this.tabelaStatus, 'clinica-relatorio-por-status', 'Relatorio de Consultas por Status');
  }

}
