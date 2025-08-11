import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cBillingComponent } from './b2c-billing.component';

describe('B2cBillingComponent', () => {
  let component: B2cBillingComponent;
  let fixture: ComponentFixture<B2cBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cBillingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
