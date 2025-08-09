import { TestBed } from '@angular/core/testing';

import { FetchChildService } from './fetch-child.service';

describe('FetchChildService', () => {
  let service: FetchChildService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchChildService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
