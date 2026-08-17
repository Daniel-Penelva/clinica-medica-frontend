import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConvenioService } from '../../../../core/services/convenio.service';

@Component({
  selector: 'app-convenio-form',
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
  ],
  templateUrl: './convenio-form.component.html',
  styleUrl: './convenio-form.component.css',
})
export class ConvenioFormComponent {

  /**
   * Injeção de dependências dos serviços necessários
   * FormBuilder: criação do formulário reativo
   * ActivatedRoute: acesso aos parâmetros da rota (para edição)
   * Router: navegação entre páginas
   * ConvenioService: comunicação com a API de convênios
   * MatSnackBar: feedback visual (mensagens de sucesso/erro)
   */
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private convenioService = inject(ConvenioService);
  private snackBar = inject(MatSnackBar);

  /**
   * Variáveis de estado do componente
   * modo: define se está em modo 'cadastro' ou 'edicao'
   * convenioId: armazena o ID do convênio quando em modo de edição
   * loading: indica se está carregando dados do convênio para edição
   * salvando: indica se está salvando o formulário (evita duplo clique)
   */
  modo: 'cadastro' | 'edicao' = 'cadastro';
  convenioId: number | null = null;
  loading = false;
  salvando = false;

  /**
   * Formulário reativo com validações
   * nome: campo obrigatório, mínimo 3 caracteres
   * registro: campo obrigatório, mínimo 3 caracteres
   */
  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    registro: ['', [Validators.required, Validators.minLength(3)]],
  });

  /**
   * Método chamado ao inicializar o componente
   * Verifica se há parâmetro 'id' na URL para determinar modo de edição
   * Se houver ID, carrega os dados do convênio para preenchimento do formulário
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Se tem ID, muda para modo de edição e carrega dados
    if (id) {
      this.modo = 'edicao';
      this.convenioId = Number(id);
      this.carregar(this.convenioId);
    }
  }

  /**
   * Método para carregar dados do convênio para edição
   * Busca convênio pelo ID via ConvenioService
   * Preenche o formulário com os dados obtidos (patchValue)
   * Em caso de erro, exibe mensagem e redireciona para lista
   * 
   * @param id - ID do convênio a ser carregado
   */
  carregar(id: number): void {
    this.loading = true;
    this.convenioService.buscarPorId(id).subscribe({
      next: (c) => {
        this.form.patchValue({ nome: c.nome, registro: c.registro }); // Preenche o formulário com os dados do convênio
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Convenio nao encontrado', 'Fechar', { duration: 3000, panelClass: ['snack-error'],});
        this.router.navigate(['/convenios']);
      },
    });
  }

  /**
   * Método chamado ao submeter o formulário
   * Valida formulário antes de enviar
   * Decide entre cadastrar (novo) ou atualizar (edição) baseado no modo
   * Exibe feedback visual de sucesso ou erro via MatSnackBar
   */
  onSubmit(): void {
    // Valida se o formulário está válido antes de prosseguir
    if (this.form.invalid) {
      this.form.markAllAsTouched;
      return;
    }

    this.salvando = true;

    // Define qual operação executar baseado no modo (cadastro ou edicao)
    const obs$ =
      this.modo === 'cadastro'
        ? this.convenioService.cadastrar(this.form.value)
        : this.convenioService.atualizar(this.convenioId!, this.form.value);

    obs$.subscribe({
      next: () => {
        const msg = this.modo === 'cadastro' ? 'Convenio cadastrado!' : "Convenio atualizado!";
        this.snackBar.open(msg, 'Fechar',{ duration: 3000, panelClass: ['snack-success'] });
        this.router.navigate(['/convenios']);
      }, error: (err) => {
        this.salvando = false;
        const msg = err.error?.message ?? 'Erro ao salvar';
        this.snackBar.open(msg, 'Fechar',{ duration: 4000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Método para voltar à lista de convênios
   * Usado no botão "Cancelar" do formulário
   */
  voltar(): void {
    this.router.navigate(['/convenios']);
  }

  /**
   * Getter para obter o título dinâmico do formulário
   * Retorna 'Novo Convenio' para cadastro ou 'Editar Convenio' para edição
   * 
   * @return Título a ser exibido no header do formulário
   */
  get titulo(): string {
    return this.modo === 'cadastro' ? 'Novo Convenio' : 'Editar Convenio';
  }
}
