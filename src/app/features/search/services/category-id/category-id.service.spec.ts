import { TestBed } from '@angular/core/testing';

import { CategoryIdService } from './category-id.service';

describe('CategoryIdService', () => {
  let service: CategoryIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
