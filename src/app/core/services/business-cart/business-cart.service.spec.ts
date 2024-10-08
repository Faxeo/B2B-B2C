import { TestBed } from '@angular/core/testing';

import { BusinessCartService } from './business-cart.service';

describe('BusinessCartService', () => {
  let service: BusinessCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
