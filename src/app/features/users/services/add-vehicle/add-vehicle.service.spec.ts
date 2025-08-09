import { TestBed } from '@angular/core/testing';

import { AddVehicleService } from './add-vehicle.service';

describe('AddVehicleService', () => {
  let service: AddVehicleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddVehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
