import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TipoUsuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-form',
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
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css',
})
export class UsuarioFormComponent {

  /**
   * Injeção de dependências dos serviços utilizados pelo componente
   * FormBuilder: criação e gerenciamento do formulário reativo
   * ActivatedRoute: leitura do ID do usuário na URL
   * Router: navegação entre as páginas
   * UsuarioService: comunicação com a API de usuários
   * MatSnackBar: exibição de mensagens de sucesso e erro
   */
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);

  /**
   * Variáveis de controle do formulário
   * modo: define se o formulário está cadastrando ou editando um usuário
   * usuarioId: armazena o ID do usuário no modo de edição
   * loading: indica o carregamento dos dados do usuário
   * salvando: indica o envio do formulário para a API
   * mostrarSenha: controla a exibição ou ocultação da senha no template
   */
  modo: 'cadastro' | 'edicao' = 'cadastro';
  usuarioId: number | null = null;
  loading = false;
  salvando = false;
  mostrarSenha = false;

  /**
   * Perfis disponíveis para seleção no formulário
   * valor: valor enviado ao backend
   * label: texto exibido para o usuário na interface
   */
  roles: { valor: TipoUsuario; label: string} [] = [
    { valor: 'ADMIN', label: 'Administrador' },
    { valor: 'MEDICO', label: 'Medico' },
    { valor: 'RECEPCIONISTA', label: 'Recepcionista' },
  ];

  /**
   * Formulário reativo de usuário
   *
   * Campos e validações:
   * nome: obrigatório e deve ter pelo menos 3 caracteres
   * email: obrigatório e deve possuir formato válido
   * senha: opcional no formulário, mas obrigatória no cadastro
   * role: obrigatório
   *
   * Na edição, a senha pode ficar vazia para manter a senha atual.
   */
  form: FormGroup = this.fb.group({
    nome:  ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.minLength(6)],
    role:  [null, Validators.required],
  });

  /**
   * Método chamado ao inicializar o componente
   *
   * Verifica se existe um ID na rota:
   * - Sem ID: mantém o modo cadastro
   * - Com ID: altera para modo edição e carrega os dados do usuário
   */
  ngOnInit(): void {
    
    // Obtém o parâmetro 'id' da URL, quando estiver no modo edição
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // Define o formulário como edição
      this.modo = 'edicao';
      this.usuarioId = Number(id);

      // Busca os dados atuais do usuário
      this.carregar(this.usuarioId);
    }
  }

  /**
   * Carrega os dados de um usuário para edição
   *
   * Preenche o formulário com nome, email e perfil.
   * A senha não é carregada por motivos de segurança; o usuário
   * somente informa uma nova senha caso queira alterá-la.
   *
   * @param id ID do usuário que será carregado
   */
  carregar(id: number): void {
    this.loading = true;

    this.usuarioService.buscarPorId(id).subscribe({
      next: (u) => {
        // Preenche o formulário com os dados recebidos da API
        this.form.patchValue({
          nome:  u.nome,
          email: u.email,
          role:  u.role,
          // A senha não é preenchida; uma nova será informada apenas se necessário
        });
        this.loading = false;
      }, error: () => {
        this.loading = false;
        this.snackBar.open('Usuario nao encontrado', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
        this.router.navigate(['/usuarios']);
      }
    });
  }

  /**
   * Submete o formulário para cadastro ou atualização do usuário
   *
   * Fluxo executado:
   * 1. Valida os campos do formulário
   * 2. Exige senha quando estiver no modo cadastro
   * 3. Remove senha vazia no modo edição
   * 4. Escolhe entre cadastrar() e atualizar()
   * 5. Exibe mensagem de sucesso ou erro
   * 6. Redireciona para a lista de usuários após sucesso
   */
  onSubmit(): void {

    // Verifica se todos os campos obrigatórios são válidos
    if (this.form.invalid) {
      // Marca os campos como tocados para exibir as mensagens de erro
      this.form.markAllAsTouched();
      return;
    }

    // No cadastro, senha é obrigatório
    if (this.modo === 'cadastro'&& !this.form.value.senha) {
      this.snackBar.open('Senha é obrigatorio no cadastro', 'Fechar', { duration: 3000, panelClass: ['snack-error'] });
      return;
    }

    // Indica que o formulário está sendo enviado
    this.salvando = true;

    // Copia os valores atuais do formulário para montar o payload da API
    const dados = this.form.value; 

    // Na edição, não envia senha vazia para não substituir a senha atual
    if (!dados.senha) delete dados.senha;

    // Escolhe a operação conforme o modo do formulário
    const obs$ = this.modo === 'cadastro'
      ? this.usuarioService.cadastrar(dados)
      : this.usuarioService.atualizar(this.usuarioId!, dados);

    // Executa a requisição de cadastro ou atualização
    obs$.subscribe({
      next: () => {
        const msg = this.modo === 'cadastro' ? 'Usuario cadastrado!' : 'Usuario atualizado!';
        this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
        this.router.navigate(['/usuarios']);
      }, error: (err) => {
        this.salvando = false;
        const msg = err.error?.message ?? 'Erro ao salvar usuario';
        this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Cancela a operação atual e retorna para a lista de usuários
   */
  voltar(): void {
    this.router.navigate(['/usuarios']); 
  }

  /**
   * Getter que retorna o título da tela de acordo com o modo atual
   *
   * @return 'Novo Usuário' no cadastro ou 'Editar Usuário' na edição
   */
  get titulo(): string {
    return this.modo === 'cadastro' ? 'Novo Usuário' : 'Editar Usuário';
  }

  /**
   * Getter que retorna o texto de orientação do campo de senha
   *
   * No cadastro, informa o tamanho mínimo da senha.
   * Na edição, informa que o campo pode ficar vazio para manter
   * a senha atual.
   *
   * @return Texto exibido como placeholder do campo de senha
   */
  get senhaPlaceholder(): string {
   return this.modo === 'edicao' ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres';
  }
}
