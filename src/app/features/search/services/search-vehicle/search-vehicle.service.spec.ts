import { TestBed } from '@angular/core/testing';

import { SearchVehicleService } from './search-vehicle.service';

describe('SearchVehicleService', () => {
  let service: SearchVehicleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchVehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
