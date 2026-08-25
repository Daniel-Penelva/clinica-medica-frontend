import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { ProntuarioService } from '../../../../core/services/prontuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-prontuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './prontuario-form.component.html',
  styleUrl: './prontuario-form.component.css',
})
export class ProntuarioFormComponent {

  /**
   * Injeção de dependências dos serviços necessários
   * FormBuilder: criação e gerenciamento do formulário reativo
   * ActivatedRoute: acesso aos parâmetros da rota (consultaId e id)
   * Router: navegação entre páginas
   * ProntuarioService: comunicação com a API de prontuários
   * MatSnackBar: feedback visual (mensagens de sucesso/erro) 
  */
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prontuarioService = inject(ProntuarioService);
  private snackBar = inject(MatSnackBar);

  /**
   * Variáveis de estado do componente
   * consultaId: ID da consulta vinculada ao prontuário (vem da URL como queryParam)
   * prontuarioId: ID do prontuário quando em modo de edição (vem da URL como pathParam)
   * modo: define se está em modo 'cadastro' (novo) ou 'edicao' (atualizar)
   * salvando: indica se está salvando o formulário (evita duplo clique)
   * loading: indica se está carregando dados do prontuário para edição
  */
  consultaId: number | null = null; // consultaId vem da URL: /prontuarios/nova?consultaId=5
  prontuarioId: number | null = null; // prontuarioId vem da URL em modo edicao: /prontuarios/:id/editar
  modo: 'cadastro' | 'edicao' =  'cadastro';
  salvando = false;
  loading = false;

  /**
   * Formulário reativo com validações
   * anamnese: campo obrigatório (histórico clínico do paciente)
   * diagnostico: campo obrigatório (diagnóstico médico)
   * prescricao: campo opcional (prescrição médica)
   * observacoes: campo opcional (observações adicionais)
  */
  form: FormGroup = this.fb.group({
    anamnese:    ['', Validators.required],
    diagnostico: ['', Validators.required],
    prescricao:  [''],
    observacoes: [''],
  });

  /**
   * Método chamado ao inicializar o componente
   * Verifica parâmetros da URL para determinar modo de operação
   * Se houver consultaId (queryParam), armazena para uso no cadastro
   * Se houver id (pathParam), muda para modo de edição e carrega prontuário
  */
  ngOnInit(): void {
    
    // Obtém o parâmetro 'consultaId' da query string (ex: /prontuarios/nova?consultaId=5)
    const consultaIdParam = this.route.snapshot.queryParamMap.get('consultaId');
    if (consultaIdParam) {
      this.consultaId = Number(consultaIdParam); // Se tem consultaId, armazena para usar no cadastro
    }

    // Obtém o parâmetro 'id' da rota (para modo de edição)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modo = 'edicao'; // Se tem ID, muda para modo de edição e carrega dados do prontuário
      this.prontuarioId = Number(id);
      this.carregarProntuario();
    }
  }

  /**
   * Método para carregar dados do prontuário para edição
   * Busca prontuário pelo consultaId via ProntuarioService
   * Preenche o formulário com os dados obtidos (patchValue)
   * Armazena o ID do prontuário para atualização posterior
   * Em caso de erro, apenas define loading=false (tratamento simples)
   */
  carregarProntuario(): void { 
    if (!this.consultaId) return;

    this.loading = true;
    this.prontuarioService.buscarPorConsulta(this.consultaId).subscribe({
      next: (p) => {
        this.prontuarioId = p.id; // Armazena o ID do prontuário para uso na atualização
        
        // Preenche o formulário com os dados do prontuário
        this.form.patchValue({
          anamnese: p.anamnese,
          diagnostico: p.diagnostico,
          prescricao:  p.prescricao,
          observacoes: p.observacoes,
        });
        this.loading = false;
      }, error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Método chamado ao submeter o formulário
   * Valida formulário antes de enviar
   * Verifica se consultaId está presente (necessário para cadastro)
   * Decide entre criar (novo) ou atualizar (edição) baseado no modo
   * Exibe feedback visual de sucesso ou erro via MatSnackBar
   * Redireciona para /consultas após salvamento com sucesso
   */
  onSubmit(): void {
    
    // Valida se o formulário está válido antes de prosseguir
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Valida se consultaId está presente (necessário para vincular prontuário à consulta)
    if (!this.consultaId && this.prontuarioId) {
      this.snackBar.open('Consulta nao identificada', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      return;
    }

    this.salvando = true;
    
    /**
     * Monta objeto de dados incluindo consultaId
     * ...this.form.value - espalha campos do formulário (anamnese, diagnostico, prescricao, observacoes)
     * consultaId: this.consultaId - adiciona consultaId ao objeto
    */
    const dados = {
      ...this.form.value, consultaId: this.consultaId
    };

    // Define qual operação executar baseado no modo (cadastro ou edicao)
    const obs$ = this.modo === 'cadastro' ? this.prontuarioService.criar(dados) : this.prontuarioService.atualizar(this.prontuarioId!, dados);

    // Executa a operação (criar ou atualizar)
    obs$.subscribe({
      next: () => {
        const msg = this.modo === 'cadastro' ? 'Prontuário criado!' : 'Prontuário atualizado!';
        this.snackBar.open(msg, 'Fechar',{ duration: 3000, panelClass: ['snack-success'] });
        this.router.navigate(['/consultas']);
      }, error: (err) => {
        this.salvando = false;
        const msg = err.error?.message ?? 'Erro ao salvar prontuario';
        this.snackBar.open(msg, 'Fechar',{ duration: 4000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Método para voltar à lista de consultas
   * Usado no botão "Cancelar" do formulário
   * Navega para /consultas sem salvar alterações
   */
  voltar(): void { 
    this.router.navigate(['/consultas']); 
  }

  /**
   * Getter para obter o título dinâmico do formulário
   * Retorna 'Novo Prontuario' para cadastro ou 'Editar Prontuario' para edição
   * Usado no header do componente para exibir título apropriado
   * 
   * @return Título a ser exibido no header do formulário
   */
  get titulo(): string {
    return this.modo === 'cadastro'? 'Novo Prontuario' : 'Editar Prontuario';
  }

}
