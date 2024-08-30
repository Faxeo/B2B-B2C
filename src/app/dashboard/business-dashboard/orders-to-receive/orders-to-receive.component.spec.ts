import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersToReceiveComponent } from './orders-to-receive.component';

describe('OrdersToReceiveComponent', () => {
  let component: OrdersToReceiveComponent;
  let fixture: ComponentFixture<OrdersToReceiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersToReceiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersToReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
