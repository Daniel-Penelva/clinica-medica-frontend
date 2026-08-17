import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvenioFormComponent } from './convenio-form.component';

describe('ConvenioFormComponent', () => {
  let component: ConvenioFormComponent;
  let fixture: ComponentFixture<ConvenioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvenioFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConvenioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
