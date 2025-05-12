import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LechofluidizadoComponent } from './lechofluidizado.component';

describe('LechofluidizadoComponent', () => {
  let component: LechofluidizadoComponent;
  let fixture: ComponentFixture<LechofluidizadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LechofluidizadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LechofluidizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
