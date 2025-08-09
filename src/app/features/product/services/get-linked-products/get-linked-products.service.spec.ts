import { TestBed } from '@angular/core/testing';

import { GetLinkedProductsService } from './get-linked-products.service';

describe('GetLinkedProductsService', () => {
  let service: GetLinkedProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetLinkedProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
