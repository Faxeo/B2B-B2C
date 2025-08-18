import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../shared/api.service';
import { VehicleSearchService } from '../../../../features/search/services/search-vehicle/search-vehicle.service';

@Injectable({
  providedIn: 'root'
})
export class AddVehicleService {
  constructor(
    private apiService: ApiService,
    private vehicleSearchService: VehicleSearchService // Inject VehicleSearchService
  ) {}

  /**
   * Adds a customer vehicle to the system using stored vehicle data.
   * @returns Observable containing the response from the API.
   */
  addCustomerVehicle(): Observable<any> {
    // Retrieve the stored vehicle data from VehicleSearchService
    const vehicleData = this.vehicleSearchService.getVehicleData();

    // Check if the vehicle data is properly stored
    console.log('Vehicle Data to be added:', vehicleData);

    // Make an API call to add the vehicle using the stored vehicle data
    return this.apiService.post<any>('Customers/addCustomerVehicles', vehicleData);
  }
}
