import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantLoginComponent } from './merchant-login.component';

describe('MerchantLoginComponent', () => {
  let component: MerchantLoginComponent;
  let fixture: ComponentFixture<MerchantLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MerchantLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
