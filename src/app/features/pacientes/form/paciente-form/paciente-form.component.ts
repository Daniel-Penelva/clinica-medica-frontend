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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../../../core/services/paciente.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-paciente-form',
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
  ],
  templateUrl: './paciente-form.component.html',
  styleUrl: './paciente-form.component.css',
})
export class PacienteFormComponent {
  /**
   * Injeção de dependências
   */
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pacienteService = inject(PacienteService);
  private snackBar = inject(MatSnackBar);

  /**
   * Variáveis de estado do componente:
   * "modo: 'cadastro' | 'edicao' = 'cadastro';" (Define se o formulário está em modo de cadastro ou edição de um paciente. O valor padrão é 'cadastro'.)
   * 'pacienteId' usado para edição (armazena o ID do paciente, ou null se estiver em modo de cadastro)
   * 'loading' para carregar os dados do paciente (modo edição)
   * 'salvando' para bloquear botões enquanto salva os dados no backend
   */
  modo: 'cadastro' | 'edicao' = 'cadastro';
  pacienteId: number | null = null;
  loading = false;
  salvando = false;

  /**
   * Lista de opções para o campo de sexo do paciente.
   * Cada opção é um objeto com as propriedades 'valor' (o valor que será enviado para o backend) e 'label' (o texto que será exibido para o usuário).
   * Usada em mat-select no HTML
   */
  sexoOpcoes = [
    { valor: 'MASCULINO', label: 'Masculino' },
    { valor: 'FEMININO', label: 'Feminino' },
    { valor: 'OUTRO', label: 'Outro' },
    { valor: 'NAO_INFORMADO', label: 'Nao informado' },
  ];

  /**
   * Definição do formulário reativo para cadastro/edição de pacientes.
   * Utilizado o Validators para garantir que os campos obrigatórios sejam preenchidos de forma correta.
   * Grupo de endereço aninhado para organizar os campos relacionados ao endereço do paciente.
   */
  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    email: ['', Validators.email],
    telefone: ['', Validators.pattern(/^\d{10,11}$/)],
    dataNascimento: [''],
    sexo: [''],
    endereco: this.fb.group({
      logradouro: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      uf: ['', Validators.maxLength(2)],
      cep: ['', Validators.pattern(/^\d{8}$/)],
    }),
  });

  /**
   * Método de inicialização do componente.
   * Verifica se há um ID de paciente na rota para determinar se o formulário deve ser carregado em modo de edição ou cadastro.
   * Se um ID for encontrado, o método carregarPaciente é chamado para buscar os dados do paciente e preencher o formulário.
   * Preenche formulário com patchValue.
   * Desabilita campo cpf.
  */
  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modo = 'edicao';
      this.pacienteId = Number(id);
      this.carregarPaciente(this.pacienteId);  // Carrega os dados do paciente para edição

      this.form.get('cpf')?.disable(); // CPF não pode ser alterado na edição
    }
  }

  /**
   * Carrega os dados de um paciente para edição, caso um ID seja fornecido na rota.
   * Realiza uma chamada ao serviço para buscar os dados do paciente e preenche o formulário com as informações retornadas.
   * patchValue -> preenche formulário com dados do backend.
   * endereco ?? {} -> se não houver, usa objeto vazio.
   * Exibe uma mensagem de erro caso o paciente não seja encontrado e redireciona para a lista de pacientes.
   */
  carregarPaciente(id: number): void {
    this.loading = true;

    this.pacienteService.buscarPorId(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          nome: p.nome,
          cpf: p.cpf,
          email: p.email,
          telefone: p.telefone,
          dataNascimento: p.dataNascimento,
          sexo: p.sexo,
          endereco: p.endereco ?? {},
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Paciente não encontrado', 'Fechar', {
          duration: 3000,
          panelClass: ['snack-error'],
        });
        this.router.navigate(['/pacientes']);
      },
    });
  }

  /**
   * Salvar paciente (cadastro ou edição)
   * Manipulador de envio do formulário para cadastro ou atualização de um paciente.
   * Realiza a validação do formulário, exibe mensagens de sucesso ou erro, e redireciona para a lista de pacientes após a operação ser condluída.
  */
  onSubmit(): void {
    
    /**
     * Validação do formulário antes de enviar os dados para o backend - Mostra erros de validação
     * Se o formulário for inválido, todos os campos serão marcados como "tocados" para exibir as mensagens de erro correspondentes,
     * e a função será encerrada sem realizar nenhuma ação adicional.
     */
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    /**
     * Indica que o processo de salvamento está em andamento, desabilitando os botões e exibindo um spinner de carregamento.
     */
    this.salvando = true;

    /**
     * getRawValue() é usado para obter os valores do formulário, mesmo que alguns campos estejam desabilitados (disable - exemplo cpf).
     * Garante que todos os dados necessários serão enviados para o backend.
     */
    const dados = this.form.getRawValue();

    /**
     * Determina qual método do serviço de paciente deve ser chamado com base no modo atual do formulário (cadastro ou edição).
     * OBS. obs$ é uma convenção comum para indicar que a variável é um Observable, facilitando a leitura e compreensão do código.
     * OBS. this.paciente! é usado para afirmar que pacienteId não é nulo, só existe em modo edição.
     */
    const obs$ = this.modo === 'cadastro' ? this.pacienteService.cadastrar(dados) : this.pacienteService.atualizar(this.pacienteId!, dados);

    /**
     * Assinatura do Observable retornado pelo serviço para lidar com a resposta da operação de cadastro ou atualização.
    */
    obs$.subscribe({
      next: () => {
        const msg = this.modo === 'cadastro' ? 'Paciente cadastrado com sucesso!' : 'Paciente atualizado com sucesso!';
        this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['snack-success'] });
        this.router.navigate(['/pacientes']);
      }, error: (err) => {
        this.salvando = false;
        const msg = err.error?.message ?? 'Erro ao salvar paciente';
        this.snackBar.open(msg, 'Fechar',{ duration: 4000, panelClass: ['snack-error'] });
      }
    });
  }

  /**
   * Para botão Cancelar
   * Navega de volta para a lista de pacientes, cancelando a operação atual.
  */
  voltar(): void {
    this.router.navigate(['/pacientes']);
  }

  /**
   * Mostra “Novo Paciente” ou “Editar Paciente” no HTML.
   * Getter para o título do formulário, que varia de acordo com o modo (cadastro ou edição).
   * Retorna "Novo Paciente" se o modo for 'cadastro' e "Editar Paciente" se o modo for 'edicao'.
  */
  get titulo(): string {
    return this.modo === 'cadastro' ? 'Novo Paciente' : 'Editar Paciente';
  }
}
