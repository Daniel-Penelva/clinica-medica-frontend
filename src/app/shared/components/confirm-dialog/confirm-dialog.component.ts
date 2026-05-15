import { Component, Inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/**
 * Interface reutilizável para configurar o dialog:
 *   . Títulos e mensagens são obrigatórios
 *   . textoBotaoConfirmar opcional, sendo Default 'Confirmar'
 *   . corDoBotao primary(azul) ou warn (vermelho)
*/
export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
  textoBotaoConfirmar?: string;
  corBotao?: 'primary' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  //templateUrl: './confirm-dialog.component.html',
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p>{{ data.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button [color]="data.corBotao ?? 'warn'" [mat-dialog-close]="true">
        {{ data.textoBotaoConfirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {

  /**
   * Construtor recebe:
   *  . dialogRef para referênciar para fechar o dialog (.close(true/false))
   *  . @Inject(MAT_DIALOG_DATA) para dados passados ao abrir o dialog
  */
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}
}

/**
 * EXPLICAÇÃO DO TEMPLATE:
 * 
 * Em [color]="data.corBotao ?? 'warn'":
 *  Para definir a cor do botão dinamicamente:
 *    - "data.corBotao" se o chamador passar corBotao: 'primary' ou 'warn'
 *    - "?? 'warn'" se não for definido, usa o padrão 'warn'
 * 
 * Em [mat-dialog-close]="true":
 *  Ao clicar nesse botão, o MatDialog fecha e retorna o valor 'true' para o chamador.
 *
 * Em {{ data.textoBotaoConfirmar ?? 'Confirmar' }}:
 *  Para o texto do botão:
 *    - "data.textoBotaoConfirmar" para se o chamador mandar algo como "Excluir" ou "Confirmar Exclusão"
 *    - "?? 'Confirmar'" se não for definido, usa "Confirmar" como texto padrão (default)
*/
