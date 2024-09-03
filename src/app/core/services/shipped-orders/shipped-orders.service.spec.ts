import { TestBed } from '@angular/core/testing';

import { ShippedOrdersService } from './shipped-orders.service';

describe('ShippedOrdersService', () => {
  let service: ShippedOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShippedOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
