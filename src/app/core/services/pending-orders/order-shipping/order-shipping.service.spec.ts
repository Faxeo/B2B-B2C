import { TestBed } from '@angular/core/testing';

import { OrderShippingService } from './order-shipping.service';

describe('OrderShippingService', () => {
  let service: OrderShippingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderShippingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
