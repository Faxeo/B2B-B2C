import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2cCartSidebarComponent } from './b2c-cart-sidebar.component';

describe('B2cCartSidebarComponent', () => {
  let component: B2cCartSidebarComponent;
  let fixture: ComponentFixture<B2cCartSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2cCartSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(B2cCartSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
