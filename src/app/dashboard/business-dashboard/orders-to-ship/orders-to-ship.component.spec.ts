import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersToShipComponent } from './orders-to-ship.component';

describe('OrdersToShipComponent', () => {
  let component: OrdersToShipComponent;
  let fixture: ComponentFixture<OrdersToShipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersToShipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersToShipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
