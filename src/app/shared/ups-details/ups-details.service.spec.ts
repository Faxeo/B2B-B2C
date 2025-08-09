import { TestBed } from '@angular/core/testing';

import { UpsDetailsService } from './ups-details.service';

describe('UpsDetailsService', () => {
  let service: UpsDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpsDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
