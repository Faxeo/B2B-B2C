import { TestBed } from '@angular/core/testing';

import { GetAddressService } from './get-address.service';

describe('GetAddressService', () => {
  let service: GetAddressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAddressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
