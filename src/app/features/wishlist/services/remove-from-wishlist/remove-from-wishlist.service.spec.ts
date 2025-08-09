import { TestBed } from '@angular/core/testing';

import { RemoveFromWishlistService } from './remove-from-wishlist.service';

describe('RemoveFromWishlistService', () => {
  let service: RemoveFromWishlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoveFromWishlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
