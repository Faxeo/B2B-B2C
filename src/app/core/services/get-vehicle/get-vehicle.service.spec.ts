import { TestBed } from '@angular/core/testing';

import { GetVehicleService } from './get-vehicle.service';

describe('GetVehicleService', () => {
  let service: GetVehicleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetVehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
