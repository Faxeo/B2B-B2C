import { TestBed } from '@angular/core/testing';

import { HierarchyProductsService } from './hierarchy-products.service';

describe('HierarchyProductsService', () => {
  let service: HierarchyProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HierarchyProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
