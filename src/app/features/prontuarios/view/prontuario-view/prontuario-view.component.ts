import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Adicionar imports para o registro do locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProntuarioService } from '../../../../core/services/prontuario.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProntuarioResponse } from '../../../../core/models/prontuario.model';

// Registrar o locale pt-BR para que as datas sejam exibidas no formato correto
registerLocaleData(localePt);

@Component({
  selector: 'app-prontuario-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  providers: [{ 
    // Adicionar o provider para o LOCALE_ID com o valor 'pt-BR'
    provide: LOCALE_ID, 
    useValue: 'pt-BR' 
  }],
  templateUrl: './prontuario-view.component.html',
  styleUrl: './prontuario-view.component.css',
})
export class ProntuarioViewComponent {

  /**
   * Injeção de dependências dos serviços necessários
   * ActivatedRoute: acesso aos parâmetros da rota (consultaId)
   * Router: navegação entre páginas
   * ProntuarioService: comunicação com a API de prontuários
   * AuthService: verificação de permissões do usuário (se necessário)
   */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prontuarioService = inject(ProntuarioService);
  protected authService = inject(AuthService);

  /**
   * Variáveis de estado do componente
   * prontuario: armazena os dados do prontuário carregado (null enquanto não carrega)
   * loading: indica se está carregando dados do prontuário da API
   */
  prontuario: ProntuarioResponse | null = null;
  loading = false;

  /**
   * Método chamado ao inicializar o componente
   * Obtém o consultaId da URL (pathParam) e busca o prontuário correspondente
   * Exibe loading enquanto carrega dados da API
   * Em caso de erro, redireciona para lista de consultas
   */
  ngOnInit(): void {
    // Obtém o parâmetro 'consultaId' da rota (ex: /prontuarios/consulta/5)
    const consultaId = Number(this.route.snapshot.paramMap.get('consultaId'));

    this.loading = true;

    // Busca prontuário pelo consultaId via ProntuarioService
    this.prontuarioService.buscarPorConsulta(consultaId).subscribe({
      next: (p) => {
        this.prontuario = p; // Armazena os dados do prontuário para exibição na tela
        this.loading = false;
      }, error: () => {
        this.loading = false;
        this.router.navigate(['/consultas']);
      }
    });
    
  }

  /**
   * Método para navegar para página de edição do prontuário
   * Verifica se prontuário está carregado antes de prosseguir
   * Navega para /prontuarios/{id}/editar com queryParam consultaId
   * Usado pelo botão "Editar" na tela de visualização
   */
  editarProntuario(): void {
    // Se não tem prontuário carregado, não faz nada
    if (!this.prontuario) return;

    // Navega para página de edição com ID do prontuário e consultaId
    this.router.navigate(
      ['/prontuarios', this.prontuario.id, 'editar'], 
      { queryParams: { consultaId: this.prontuario.consultaId } }
    );
  }

  /**
   * Método para voltar à lista de consultas
   * Usado no botão "Voltar" da tela de visualização
   * Navega para /consultas sem salvar alterações
   */
  voltar(): void {
    this.router.navigate(['/consultas']);
  }
}
