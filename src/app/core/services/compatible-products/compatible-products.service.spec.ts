import { TestBed } from '@angular/core/testing';

import { CompatibleProductsService } from './compatible-products.service';

describe('CompatibleProductsService', () => {
  let service: CompatibleProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompatibleProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
