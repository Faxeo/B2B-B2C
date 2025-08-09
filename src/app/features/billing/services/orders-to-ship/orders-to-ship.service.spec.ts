import { TestBed } from '@angular/core/testing';

import { OrdersToShipService } from './orders-to-ship.service';

describe('OrdersToShipService', () => {
  let service: OrdersToShipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersToShipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
