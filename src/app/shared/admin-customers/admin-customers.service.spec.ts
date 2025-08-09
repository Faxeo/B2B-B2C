import { TestBed } from '@angular/core/testing';

import { AdminCustomersService } from './admin-customers.service';

describe('AdminCustomersService', () => {
  let service: AdminCustomersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCustomersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
