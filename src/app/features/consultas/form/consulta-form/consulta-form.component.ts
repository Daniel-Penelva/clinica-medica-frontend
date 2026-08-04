import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Adicionar imports para o registro do locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ConsultaService } from '../../../../core/services/consulta.service';
import { PacienteService } from '../../../../core/services/paciente.service';
import { MedicoService } from '../../../../core/services/medico.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PacienteResponse } from '../../../../core/models/paciente.model';
import { MedicoResponse } from '../../../../core/models/medico.model';

// Registrar o locale pt-BR para que as datas sejam exibidas no formato correto
registerLocaleData(localePt);

@Component({
  selector: 'app-consulta-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  providers: [
    // Adicionar o provider para o LOCALE_ID com o valor 'pt-BR'
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
  templateUrl: './consulta-form.component.html',
  styleUrl: './consulta-form.component.css',
})
export class ConsultaFormComponent {
  // Injetar os serviços necessários usando o método inject()
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private snackBar = inject(MatSnackBar);

  pacientes: PacienteResponse[] = []; // Array para armazenar os pacientes carregados do backend
  medicos: MedicoResponse[] = []; // Array para armazenar os médicos carregados do backend

  salvando = false; // Variável para controlar o estado de salvamento do formulário
  minDate = new Date(); // Data mínima para o datepicker (hoje)

  // Array de horários disponíveis para agendamento de consultas
  horasDisponiveis = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
  ];

  /**
   * Formulário reativo para agendamento de consultas
   * Campos:
   *  - pacienteId: ID do paciente selecionado (obrigatório)
   *  - medicoId: ID do médico selecionado (obrigatório)
   *  - data: Data da consulta selecionada (obrigatorio)
   *  - hora: Hora da consulta selecionada (obrigatório)
  */
  form: FormGroup = this.fb.group({
    pacienteId: [null, Validators.required],
    medicoId:   [null, Validators.required],
    data:       [null, Validators.required],  // Date do datepicker
    hora:       ['',   Validators.required],  // string 'HH:mm'
  });

  /**
   * Método chamado ao inicializar o componente
   * Carrega os pacientes e médicos do backend para popular os selects do formulário.
   * page.content é usado para acessar os dados da página retornada pelo backend.
  */
  ngOnInit(): void {
    this.pacienteService.listar(0, 999).subscribe(page => this.pacientes = page.content);
    this.medicoService.listar(0, 999).subscribe(page => this.medicos = page.content);
  }

  /**
   * Método chamado ao submeter o formulário 
   * Valida o formulário, formata a data e hora para o padrão ISO 8601 e envia a requisição de agendamento
   * ao backend. Exibe mensagens de sucesso ou erro usando o MatSnackBar.
  */
  onSubmit(): void {
    // Se o formulário for inválido, marca todos os campos como tocados para exibir mensagens de erro
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true; // Indica que o salvamento está em andamento
    const { pacienteId, medicoId, data, hora } = this.form.value; // Desestrutura os valores do formulário

    const d = data as Date; // Cria um objeto Date a partir da data selecionada
    
    // Formata a data e hora no padrão ISO 8601 para envio ao backend
    const dataHora = `${d.getFullYear()}-${
      String(d.getMonth() + 1).padStart(2,'0')}-${
      String(d.getDate()).padStart(2,'0')}T${hora}:00`;

    this.consultaService.agendar({ pacienteId, medicoId, dataHora}).subscribe({
      next: () => {
        this.snackBar.open('Consulta agendada!', 'Fechar',{ duration: 3000, panelClass: ['snack-success'] });
        this.router.navigate(['/consultas']);
      }, error: (err) => {
        this.salvando = false; // Indica que o salvamento falhou
        const msg = err.error?.message ?? 'Erro ao agendar'; // Mensagem de erro padrão caso não haja mensagem especifica do backend
        this.snackBar.open(msg, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
      }
    });
  }

  // Método para voltar à lista de consultas
  voltar(): void {
    this.router.navigate(['/consultas']);
  }
}
