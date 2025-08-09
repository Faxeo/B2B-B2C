import { TestBed } from '@angular/core/testing';

import { DeleteVehicleService } from './delete-vehicle.service';

describe('DeleteVehicleService', () => {
  let service: DeleteVehicleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteVehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
