import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtermicosComponent } from './ttermicos.component';

describe('TtermicosComponent', () => {
  let component: TtermicosComponent;
  let fixture: ComponentFixture<TtermicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TtermicosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TtermicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
