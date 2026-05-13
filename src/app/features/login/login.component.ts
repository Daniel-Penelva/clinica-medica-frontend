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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
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
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  
  /* Injetando o FormBuilder para criar o formulário de login, o AuthService para realizar a autenticação, 
  o Router para navegação e o MatSnackBar para exibir mensagens de erro. */
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  /* Estado do formulário */
  loading = false;
  mostrarSenha = false;

  /* FormGroup com validações */
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Método que define dois getters (emailCtrl e senhaCtrl) para acessar os campos do formulário facilmente no html, ou seja, eles retornam os
   * controles de formulário dos campos 'email' e 'senha'.
   *
   * O ! no final diz que esse valor não será nulo (null) ou indefinido (undefined), força para não nulo e exige que os campos 'email' e 'senha'
   * sempre exista no formulário - Sem o ! teria que fazer um condicionamento de checagem.  */
  get emailCtrl() {
    return this.form.get('email')!;
  }
  get senhaCtrl() {
    return this.form.get('senha')!;
  }

  /* Mensagens de erro do campo email */
  getEmailErro(): string {
    if (this.emailCtrl.hasError('required')) return 'Email é obrigatório';
    if (this.emailCtrl.hasError('email')) return 'Email inválido';
    return '';
  }

  /* Mensagens de erro do campo senha. */
  getSenhaErro(): string {
    if (this.senhaCtrl.hasError('required')) return 'Senha é obrigatória';
    if (this.senhaCtrl.hasError('minlength')) return 'Mínimo 6 caracteres';
    return '';
  }

  /**
   * Método chamado quando o formulário é submetido. Ele verifica se o formulário é válido, e se não for, marca todos os campos como tocados
   * para exibir as mensagens de erro. Se o formulário for válido, ele pode prosseguir com a lógica de autenticação.
   *
   * O método markAllAsTouched() é usado para marcar todos os controles do formulário como "tocados" (touched), o que faz com que as mensagens
   * de erro sejam exxibidas para os campos que não foram preenchidos corretamente.
   * 
   * O método subscribe() é usado para lidar com a resposta da chamada de login. 
   * O operador next é chamado quando a autenticação é bem-sucedida, e o usuário é redirecionado para o dashboard.
   * O operador error é chamado quando ocorre um erro durante a autenticação, e o spinner de carregamento é ocultado, e uma mensagem de erro é exibida usando o MatSnackBar.
   * 
   * <code> const msg = err.error?.message ?? 'Email ou senha inválidos'; </code>
   * Essa linha de código é uma forma de obter a mensagem de erro da resposta do servidor. Ele verifica se existe uma propriedade 'message' dentro
   * do objeto 'error' da resposta de erro (err.error?.message). Se essa propriedade existir, ela será usada como a mensagem de erro. Caso contrário, 
   * a mensagem padrão 'Email ou senha inválidos' será usada. O operador ?? é o operador de coalescência nula, que retorna o valor à esquerda se
   * ele não for null ou undefined, caso contrário, retorna o valor à direita. Portanto, se err.error?.message for null ou undefined, a mensagem
   * padrão será exibida.
   * */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true; // Exibe o spinner de carregamento

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false; // Esconde o spinner de carregamento
        const msg = err.error?.message ?? 'Email ou senha inválidos';
        this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
      },
    });
  }
}

/**
 * O LoginComponent é um componente Angular que representa a página de login da aplicação. Ele utiliza Reactive Forms para criar um formulário de 
 * login com validação de email e senha. 
 * 
 * O componente também utiliza o AuthService para realizar a autenticação do usuário, o Router para navegação e o MatSnackBar para exibir 
 * mensagens de erro. 
 * 
 * O método inSubmit() é chamado quando o formulário é submetido, e ele verifica se o formulário é válido. Se for válido, ele chama o método de 
 * login do AuthService e lida com a resposta usando subscribe(). Se a autenticação for bem-sucedida, o usuário é redirecionado para o dashboard.
 * Se ocorrer um erro durante a autenticação, o spinner de carregamento é ocultado e uma mensagem de erro é exibida usando o MatSnackBar.
*/
