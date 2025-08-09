import { TestBed } from '@angular/core/testing';

import { BusinessProfileService } from './business-profile.service';

describe('BusinessProfileService', () => {
  let service: BusinessProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
