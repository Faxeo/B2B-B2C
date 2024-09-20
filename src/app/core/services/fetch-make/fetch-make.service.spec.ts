import { TestBed } from '@angular/core/testing';

import { FetchMakeService } from './fetch-make.service';

describe('FetchMakeService', () => {
  let service: FetchMakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchMakeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
