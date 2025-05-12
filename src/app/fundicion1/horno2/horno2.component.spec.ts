import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Horno2Component } from './horno2.component';

describe('Horno2Component', () => {
  let component: Horno2Component;
  let fixture: ComponentFixture<Horno2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Horno2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Horno2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
