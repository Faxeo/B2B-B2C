import { TestBed } from '@angular/core/testing';

import { AddAddressService } from './add-address.service';

describe('AddAddressService', () => {
  let service: AddAddressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddAddressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
