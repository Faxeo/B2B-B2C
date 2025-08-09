import { TestBed } from '@angular/core/testing';

import { MainCategpryService } from './main-category.service';

describe('MainCategpryService', () => {
  let service: MainCategpryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainCategpryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
