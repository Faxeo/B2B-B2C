import { TestBed } from '@angular/core/testing';

import { BusinessRequestsService } from './business-requests.service';

describe('BusinessRequestsService', () => {
  let service: BusinessRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
