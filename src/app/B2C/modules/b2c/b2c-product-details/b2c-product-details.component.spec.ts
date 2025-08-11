import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cProductDetailsComponent } from './b2c-product-details.component';

describe('B2cProductDetailsComponent', () => {
  let component: B2cProductDetailsComponent;
  let fixture: ComponentFixture<B2cProductDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cProductDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
