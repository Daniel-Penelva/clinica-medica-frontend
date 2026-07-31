import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasListaComponent } from './consultas-lista.component';

describe('ConsultasListaComponent', () => {
  let component: ConsultasListaComponent;
  let fixture: ComponentFixture<ConsultasListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultasListaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultasListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
