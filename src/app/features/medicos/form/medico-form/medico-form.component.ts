import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicoService } from '../../../../core/services/medico.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EspecialidadeResponse } from '../../../../core/models/medico.model';

@Component({
  selector: 'app-medico-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './medico-form.component.html',
  styleUrl: './medico-form.component.css',
})
export class MedicoFormComponent {
  /**
   * Injeção de dependências */
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private medicoService = inject(MedicoService);
  private snackBar = inject(MatSnackBar);

  /**
   * Estado do componente - Variáveis
   * 'modo' indica se o fomulário está em modo de cadastro ou edição, isso vai influenciar o comportamento do formulário e as ações realizadas ao salvar
   * ID do médico sendo editado (se aplicável)
   * Flags de loading para indicar quando os dados estão sendo carregados ou salvos
   * 'salvando' vai ser usado para desabilitar o botão de salvar e mostrar um spinner enquanto a requisição de salvar está em andamento
   */
  modo: 'cadastro' | 'edicao' = 'cadastro';
  medicoId: number | null = null;
  loading = false;
  salvando = false;

  /**
   * Todas as especialidades disponíveis para seleção no formulário - vai popular o dropdown de especialidades e permitir que o usuário adicione
   * ou remova especialidades do médico
   */
  todasEspecialidades: EspecialidadeResponse[] = [];

  /**
   * Especialidades já vinculadas ao médico (no caso de edição) - isso vai ser usado para mostrar as especialidades atuais do médico e permitir
   * que o usuário remova ou adicione novas especialidades
   */
  especialidadesDoMedico: EspecialidadeResponse[] = [];

  /**
   * Formulário reativo para cadastro/edição de médico
   */
  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    crm: ['', [Validators.required, Validators.pattern(/^\d{4,7}$/)]],
    email: ['', Validators.email],
    telefone: ['', Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)],
    especialidadeIds: [[], Validators.required], // IDs das especialidades selecionadas no cadastro
  });

  /**
   * Inicializa carregando as especialidades disponiveis do médico e o modo de edição do medico
  */
  ngOnInit(): void {

    // Carrega todas as especialidades disponíveis
    this.medicoService.listarEspecialidades().subscribe(
      esps => this.todasEspecialidades = esps
    );

    const id = this.route.snapshot.paramMap.get('id'); // captura o id do médico
    if (id) {
      this.modo     = 'edicao';
      this.medicoId = Number(id);
      this.form.get('crm')?.disable();  // desabilita o campo CRM do médico
      this.carregarMedico(this.medicoId);
    }
  }

  /**
   * Carrega os dados do médico para edição, incluindo as especialidades vinculadas a ele. 
   * Essa função é chamada quando o componente é inicializado em modo de edição, ou seja, quando um ID de médico é fornecido na rota.
   * Ela faz uma requisição para buscar os detalhes do médico, e ao receber a resposta, preenche o formulário com os dados do médico e
   * as especialidades vinculadas a ele. Se ocorrer um erro exibe uma mensagem de erro e redireciona o usuário de volta para a lista 
   * de médicos.
  */
  carregarMedico(id: number): void {
    this.loading = true;

    this.medicoService.buscarPorId(id).subscribe({
      next:(m) => {
        this.especialidadesDoMedico = m.especialidades;
        this.form.patchValue({
          nome: m.nome,
          crm: m.crm,
          email: m.email,
          telefone: this.aplicarMascaraTelefone(m.telefone ?? ''),
          especialidadeIds: m.especialidades.map(e => e.id)
        });
        this.loading = false;
      }, error: () => {
        this.loading = false;
        this.snackBar.open('Medico nao encontrado', 'Fechar',{ duration: 3000, panelClass: ['snack-error'] });
        this.router.navigate(['/medicos']);
      }
    });
  }

  /**
   * Método de formulário de médico, que salva (cria ou atualiza) um médico no backend, com validação, remoção de máscara e feedback ao usuário
  */
  onSubmit(): void {

    /**
     * Validação do formulário - se o formulário for inválido, marca todos os campos como tocados para exibir as mensagens de erro e retorna 
     * sem fazer nada. Garante que o usuário veja quais campos precisam ser corrigidos antes de tentar salvar novamente.*/ 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true; // ativa o estado de salvando para desabilitar o botão de salvar e mostrar o spinner de carregamento no botão
    const dados = this.form.getRawValue(); // obtém os dados do formulário, incluindo os campos desabilitados (CRM desabilitado em edição)

    /**
     * Formatação do telefone - remove todos os caracteres não númericos do telefone para garantir que o número seja salvo em um formato 
     * consistente no backend, independentemente de como o usuário tenha digitado o número (com ou sem formatação). Isso facilita a validação 
     * e o armazenamento do número de telefone já que o backend só espera números (não a mascara visual), além de evitar problemas com diferentes 
     * formatos de entrada.
    */
    if (dados.telefone) {
      dados.telefone = dados.telefone.replace(/\D/g, ''); // 
    }

    /**
     * Chamada ao serviço para salvar os dados - dependendo do modo do formulário (cadastro ou edição), chama o método correspondente do serviço 
     * de médico.
     * Se estiver em modo de cadastro, chama o método 'cadastrar' para criar um novo médico com os dados fornecidos. 
     * Se estiver em modo de edição, chama o método 'atualizar' para atualizar o médico existente. O operador non-null assertion garante que o 
     * medicoId não seja null  */
    const obs$ = this.modo === 'cadastro' ? this.medicoService.cadastrar(dados) : this.medicoService.atualizar(this.medicoId!, dados);

    /**
     * Assinatura do Observable de sucesso e erro
    */
    obs$.subscribe({
      next: () => {
        const msg = this.modo === 'cadastro' ? 'Médico cadastrado com sucesso!' : 'Médico atualizado com sucesso!';
        this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
        this.router.navigate(['/medicos']);
      }, error: (err) => {
        this.salvando = false; // desativa o estado de salvando para reabilitar o botão e esconder o spinner
        const msg = err.error?.message ?? 'Erro ao salvar o médico';
        this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
      }
    });
  }

  //------------- Gerenciamento individual de especialidades (só na edição) ------------------------------------------------

  /**
   * Adiciona uma especialidade a um médico chamando o backend e atualizando a lista localmente
  */
  adicionarEspecialidade(espId: number): void {
    if (!this.medicoId) return; // Verifica se o médico existe - só acontece em modo edição
    this.medicoService.adicionarEspecialidade(this.medicoId, espId).subscribe({
      next: (medico) => {
        this.especialidadesDoMedico = medico.especialidades; // atualiza a lista local de especialidades
        this.snackBar.open('Especialidade adicionada!', 'Fechar', { duration: 2000, panelClass: ['snack-success'] });
      }, error: (err) => {
        const msg = err.error?.message ?? 'Erro ao adicionar';
        this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }


  /**
   * Remove uma especialidade a um médico chamando o backend e atualizando a lista localmente
  */
  removerEspecialidade(espId: number): void {
    if (!this.medicoId) return; // Verifica se o médico existe - só acontece em modo edição
    this.medicoService.removerEspecialidade(this.medicoId, espId).subscribe({
      next: (medico) => {
        this.especialidadesDoMedico = medico.especialidades; // atualiza a lista local de especialidades
        this.snackBar.open('Especialidade removida!', 'Fechar', { duration: 2000, panelClass: ['snack-success'] });
      }, error: (err) => {
        const msg = err.error?.message ?? 'Erro ao remover';
        this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Filtro de especialidades - Especialidades ainda não vinculadas ao médico
   * O objetivo é evitar duplicidade de especialidades no mesmo médico, ou seja, no <mat-select> vai mostrar apenas especialidades disponíveis 
   * para adicionar.
  */
  get especialidadesDisponiveis(): EspecialidadeResponse[] {
    /**
     * pega as especialidades já vinculadas ao médico
     * Ex: [1, 3, 5] (Cardiologia, Ortopedia, Pediatria)
     */
    const idsVinculados = this.especialidadesDoMedico.map(e => e.id);

    /**
     * retorna filtrando todas as especialidades excluindo as já vinculadas
     * Ex: se todasEspecialidades = [1,2,3,4,5])
     * Resultado: [2, 4] (Endocrinologia, Neurologia)
    */
    return this.todasEspecialidades.filter(e => !idsVinculados.includes(e.id)); 
  }

  /**
   * Formatar Telefone - Máscara virtual progressiva enquanto digita
  */
  formatarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input .value.replace(/\D/g, '').substring(0, 11); // Remove caracteres não numéricos

    // Aplica máscara conforme quantidade de dígitos
    if (valor.length > 10) {
      valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }

    input.value = valor;

    // atualiza o FormControl - 'emitEvent: false' não dispara valueChanges (evita loops/reformatação).
    this.form.get('telefone')?.setValue(valor, { emitEvent: false }); 
  }

  /**
   * Para edição - Chamado para formatar dados vindo da API
   * Garante que a formatação do telefone venha aplicada na edição
  */
  private aplicarMascaraTelefone(telefone: string): string {

    let valor = telefone.replace(/\D/g, '').substring(0, 11);

    if (valor.length > 10) {
      return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length > 6) {
      return valor.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
      return valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    return valor;
  }

  /**
   * Navegação - redireciona para lista de médicos - usado no botão 'Cancelar'
  */
  voltar(): void {
    this.router.navigate(['/medicos']); 
  }

  /**
   * Retorna o título dinâmico - Cadastro (Novo Médico) e Edição (Editar Médico)
   * Getter - usado no HTML como {{ titulo }}
  */
  get titulo(): string {
    return this.modo === 'cadastro' ? 'Novo Medico' : 'Editar Medico';
  }
}
