import { TestBed } from '@angular/core/testing';

import { DeleteCartService } from './delete-cart.service';

describe('DeleteCartService', () => {
  let service: DeleteCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
