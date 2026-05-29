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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Estado, ESTADOS_BRASILEIROS } from '../../../../core/models/estados.model';
import { CepService } from '../../../../core/services/cep.service';
import { PacienteService } from '../../../../core/services/paciente.service';

// Novos imports
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

/**
 * Registro do locale para português do Brasil, garantindo que as datas sejam exibidas no formato correto e que os componentes de 
 * data do Angular Material funcionem adequadamente com a localidade brasileira.
*/
registerLocaleData(localePt)

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
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
  private cepService = inject(CepService);

  /**
   * Variáveis de estado do componente:
   * "modo: 'cadastro' | 'edicao' = 'cadastro';" (Define se o formulário está em modo de cadastro ou edição de um paciente. O valor padrão é 'cadastro'.)
   * 'pacienteId' usado para edição (armazena o ID do paciente, ou null se estiver em modo de cadastro)
   * 'loading' para carregar os dados do paciente (modo edição)
   * 'salvando' para bloquear botões enquanto salva os dados no backend
   * 'estados' para preencher o select de estados no formulário de endereço - Lista de estados para o campo de UF no formulário de endereço
   * 'buscandoCep' para mostrar um spinner de carregamento enquanto busca os dados do CEP
   * 'cepNaoEncontrado' para exibir uma mensagem de erro caso o CEP informado não seja encontrado na base do ViaCEP
   */
  modo: 'cadastro' | 'edicao' = 'cadastro';
  pacienteId: number | null = null;
  loading = false;
  salvando = false;
  
  estados: Estado[] = ESTADOS_BRASILEIROS;
  buscandoCep = false;
  cepNaoEncontrado = false;

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
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]], // Validação COM máscara
    email: ['', Validators.email],
    telefone: ['', Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)], // Validação COM máscara
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
   * Formatação do campo de CPF enquanto o usuário digita, aplicando a máscara "XXX.XXX.XXX-XX".
   * O método é acionado no evento de input do campo de CPF, garantindo que a formatação seja aplicada em tempo real conforme o usuário digita.
   * O método remove quaisquer caracteres não numéricos do valor do campo, limita a entrada a 11 dígitos, e aplica a máscara progressivamente conforme o número de dígitos aumenta.
   * Após formatar o valor, o método atualiza o campo de input com a máscara aplicada e também atualiza o valor do formulário reativo sem emitir um evento de mudança para evitar loops infinitos de formatação.
   * OBS. O campo de CPF é desabilitado no modo de edição.
  */
  formatarCpf(event: Event): void {

    /**
     * Obtém o elemento de input a partir do evento de entrada, garantindo que seja do tipo HTMLInputElement para acessar as propriedades específicas de um campo de texto.*/ 
    const input = event.target as HTMLInputElement;

    let valor = input.value.replace(/\D/g, '');       // remove nao numericos
    valor = valor.substring(0, 11);                   // limita a 11 digitos

    // Aplica a máscara progressivamente conforme o usuário digita - XXX.XXX.XXX-XX
    if (valor.length > 9) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (valor.length > 3) {
      valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    // Atualiza o valor do campo de input com a máscara aplicada
    input.value = valor;

    // Atualiza o valor do formulário reativo sem emitir um evento de mudança para evitar loops infinitos de formatação
    this.form.get('cpf')?.setValue(valor, { emitEvent: false });
  }

  /**
   * Formatação do campo de telefone enquanto o usuário digita, aplicando as máscaras (XX) XXXX-XXXX ou (XX) XXXXX-XXXX dependendo do 
   * número de dígitos.
  */
  formatarTelefone(event: Event): void {

    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    valor = valor.substring(0, 11);

    // Aplica a mascara progressivamente conforme o usuário digita - (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
    if (valor.length > 10) {
      valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }

    input.value = valor;
    this.form.get('telefone')?.setValue(valor, { emitEvent: false });
  }

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
   * O "+ 'T00:00:00'" é adicionado para garantir que a data seja interpretada corretamente como uma data local, sem ele o javascript interpreta 
   * a data como UTC e pode mostrar o dia anterior dependendo do fuso horário do usuário.
   * Durante o carregamento, a variável "loading" é usada para exibir um spinner de carregamento no formulário, indicando que os dados estão sendo buscados.
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
          dataNascimento: p.dataNascimento ? new Date(p.dataNascimento + 'T00:00:00') : null, // Converte string para Date, adicionando horário para evitar problemas de fuso horário
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
     * Limpa as máscaras de CPF e telefone antes de enviar os dados para o backend, garantindo que apenas os números sejam enviados, conforme esperado pela API.
    */
    if (dados.cpf) {
      dados.cpf = dados.cpf.replace(/\D/g, ''); // Remove a formatação do CPF antes de enviar para o backend
    }
    if (dados.telefone) {
      dados.telefone = dados.telefone.replace(/\D/g, ''); // Remove a formatação do telefone antes de enviar para o backend
    }

    /**
     * Formata a data de nascimento para o formato "YYYY-MM-DD" antes de enviar os dados para o backend, garantindo que a API receba a data no formato esperado.
     * (1) Vai verificar se é a dataNasciemnto é realmente um objeto Date - decidir fazer dessa maneira porque evita erros se o valor já for null, undefined ou uma string.
     * (2) Pega o objeto Date em 'd' para facilitar o acesso ao método getFullYear(), getMonth() e getDate().
     * (3) Converter para yyyy-MM-dd
     *    <code> dados.dataNascimento = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; </code>
     *    (A) Ano: d.getFullYear() - retorna o ano completo (ex: 2000)
     *    (B) Mês: String(d.getMonth() + 1).padStart(2, '0') - retorna o mês (0-11), então é somado mais 1 para obter o valor o mês real (1-12) 
     *             e String(...).padStart(2, '0') para garantir que o mês seja sempre representado com dois dígitos (ex: "01" para janeiro).
     *    (C) Dia: String(d.getDate()).padStart(2, '0') - retorna o dia do mês (1-31) e também é formatado para ter dois dígitos (ex: "05" para o dia 5).
     * O resultado final é uma string no formato "YYYY-MM-DD" ("2000-01-05") que é o formato esperado pela API para a data de nascimento.
     */
    if (dados.dataNascimento instanceof Date) {
      const d = dados.dataNascimento;
      dados.dataNascimento = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

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


  /**
   * Busca os dados de endereço a partir do CEP informado no formulário utilizando a API ViaCEP.
   * O método é acionado quando o campo de CEP perde o foco (blur) ou quando o usuário clica no ícone de busca ao lado do campo de CEP.
   * Realiza validações para garantir que o CEP tenha o formato correto antes de fazer a consulta.
   * Durante a busca, os campos de endereço são desabilitados para evitar edição pelo usuário, e um spinner de carregamento é exibido no campo de CEP.
   * Se o CEP for encontrado, os campos de endereço são preenchidos automaticamente com os dados retornados pela API.
   * Caso contrario o formulário exibe uma mensagem de erro indicando que o CEP não foi encontrado, e os campos de endereço são limpos para permitir que o usuário tente outro CEP ou corrija o valor.
   * Em caso de erro na requisição (ex: problemas de conexão), os campos de endereço são reabilitados para permitir que o usuário corrija o CEP ou tente outro, e o spinner de carregamento é removido.
  */
  buscarCep(): void {

    // Obtém o valor do campo de CEP do formulário, garantindo que seja uma string (caso o campo seja nulo, usa string vazia como fallback).
    const cep = this.form.get('endereco.cep')?.value ?? '';

    // Limpa o aviso anterior de CEP não encontrado
    this.cepNaoEncontrado = false;

    // Só consulta o CEP se tiver exatamente 8 dígitos numéricos - uso do replace para remover caracteres não númericos
    if (cep.replace(/\D/g, '').length !== 8) return;

    // Indica que a busca por CEP está em andamento, para mostrar um spinner de carregamento no campo de CEP
    this.buscandoCep = true;

    // Desabilita os campos de endereço durante a consulta para evitar edição do usuário enquanto os dados estão sendo carregados
    this.form.get('endereco')?.disable();

    this.cepService.buscar(cep).subscribe({
      next: (dados) => {
        this.buscandoCep = false;
        this.form.get('endereco')?.enable(); // Reabilita os campos de endereço após a consulta - mesmo que o CEP não seja encontrado, o usuário pode querer corrigir ou tentar outro CEP

        if (!dados) {
          this.cepNaoEncontrado = true; // Exibe mensagem de erro caso o CEP não seja encontrado - Limpa os campos e avisa o usuário
          this.form.get('endereco')?.patchValue({
            logradouro: '',
            bairro: '',
            cidade: '',
            uf: ''
          });
          return;
        }

        // Preenche os campos automaticamente com os dados retornados pela API ViaCEP usando patchValue para atualizar apenas os campos relacionados ao endereço
        this.form.get('endereco')?.patchValue({
          logradouro: dados.logradouro,
          bairro:     dados.bairro,
          cidade:     dados.localidade,  // ViaCEP usa 'localidade'
          uf:         dados.uf
        });
      }, error: () => {
        this.buscandoCep = false;
        this.form.get('endereco')?.enable(); // Reabilita os campos de endereço mesmo em caso de erro na consulta, para permitir que o usuário corrija o CEP ou tente outro
      }
    });
  }
}
