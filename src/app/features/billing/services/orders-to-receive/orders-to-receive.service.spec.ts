import { TestBed } from '@angular/core/testing';

import { OrdersToReceiveService } from './orders-to-receive.service';

describe('OrdersToReceiveService', () => {
  let service: OrdersToReceiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersToReceiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
