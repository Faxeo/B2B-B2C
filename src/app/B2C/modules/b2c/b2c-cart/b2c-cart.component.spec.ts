import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cCartComponent } from './b2c-cart.component';

describe('B2cCartComponent', () => {
  let component: B2cCartComponent;
  let fixture: ComponentFixture<B2cCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cCartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
