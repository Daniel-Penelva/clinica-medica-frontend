import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  //templateUrl: './dashboard.component.html',
  template: `
    <div class="page-container">
      <h2>Dashboard</h2>
      <p>Bem-vindo ao sistema da Clinica Medica!</p>
      <mat-card>
        <mat-card-content>
          <p>Em breve: estatísticas e gráficos.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
