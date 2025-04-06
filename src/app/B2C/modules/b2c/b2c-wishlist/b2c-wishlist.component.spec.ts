import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cWishlistComponent } from './b2c-wishlist.component';

describe('B2cWishlistComponent', () => {
  let component: B2cWishlistComponent;
  let fixture: ComponentFixture<B2cWishlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cWishlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cWishlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
