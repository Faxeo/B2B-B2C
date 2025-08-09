import { TestBed } from '@angular/core/testing';

import { FilterSearchService } from './filter-search.service';

describe('FilterSearchService', () => {
  let service: FilterSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
