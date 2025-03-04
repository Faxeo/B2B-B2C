import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cCheckoutComponent } from './b2c-checkout.component';

describe('B2cCheckoutComponent', () => {
  let component: B2cCheckoutComponent;
  let fixture: ComponentFixture<B2cCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cCheckoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
