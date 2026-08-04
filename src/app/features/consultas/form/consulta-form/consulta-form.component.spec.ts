import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaFormComponent } from './consulta-form.component';

describe('ConsultaFormComponent', () => {
  let component: ConsultaFormComponent;
  let fixture: ComponentFixture<ConsultaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
