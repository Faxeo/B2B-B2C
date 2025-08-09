import { TestBed } from '@angular/core/testing';

import { DynamicSearchService } from './dynamic-search.service';

describe('DynamicSearchService', () => {
  let service: DynamicSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
