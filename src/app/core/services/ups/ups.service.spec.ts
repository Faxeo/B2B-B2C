import { TestBed } from '@angular/core/testing';

import { UpsService } from './ups.service';

describe('UpsService', () => {
  let service: UpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
