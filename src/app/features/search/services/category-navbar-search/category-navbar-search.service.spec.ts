import { TestBed } from '@angular/core/testing';

import { CategoryNavbarSearchService } from './category-navbar-search.service';

describe('CategoryNavbarSearchService', () => {
  let service: CategoryNavbarSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryNavbarSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
