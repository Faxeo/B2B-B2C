import { TestBed } from '@angular/core/testing';

import { FetchYearService } from './fetch-year.service';

describe('FetchYearService', () => {
  let service: FetchYearService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchYearService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
