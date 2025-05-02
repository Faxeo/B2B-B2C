import { TestBed } from '@angular/core/testing';

import { YearMakeModelService } from './year-make-model.service';

describe('YearMakeModelService', () => {
  let service: YearMakeModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YearMakeModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
