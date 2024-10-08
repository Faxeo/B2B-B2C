import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service'; // Adjust the path as necessary

interface VehicleResponse {
  success: boolean;
  statusCode: number;
  statusReason: string;
  data: any[]; // Or define a more specific type for vehicles
}

@Injectable({
  providedIn: 'root',
})
export class GetVehicleService {
  constructor(private apiService: ApiService) {}

  /**
   * Retrieves the list of customer vehicles from the server.
   * @param customerId - The ID of the customer to get vehicles for.
   * @returns Observable containing the list of customer vehicles.
   */
  getCustomerVehicles(customerId: number): Observable<VehicleResponse> {
    const requestBody = { customerID: customerId };
    // Remove leading slash from endpoint
    return this.apiService.post<VehicleResponse>('Customers/getCustomerVehicles', requestBody);
  }
}
