import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConveniosListaComponent } from './convenios-lista.component';

describe('ConveniosListaComponent', () => {
  let component: ConveniosListaComponent;
  let fixture: ComponentFixture<ConveniosListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConveniosListaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConveniosListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
