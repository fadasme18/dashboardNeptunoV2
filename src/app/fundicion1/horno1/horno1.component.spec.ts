import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Horno1Component } from './horno1.component';

describe('Horno1Component', () => {
  let component: Horno1Component;
  let fixture: ComponentFixture<Horno1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Horno1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Horno1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
