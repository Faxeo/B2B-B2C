import { TestBed } from '@angular/core/testing';

import { AdminMerchantsService } from './admin-merchants.service';

describe('AdminMerchantsService', () => {
  let service: AdminMerchantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminMerchantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
