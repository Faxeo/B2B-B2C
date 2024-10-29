import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service'; // Adjust the path as necessary

interface DeleteResponse {
  success: boolean;
  statusCode: number;
  statusReason: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeleteVehicleService {
  constructor(private apiService: ApiService) {}

  /**
   * Deletes a vehicle based on the provided vehicle details.
   * @param vehicleData - Object containing the vehicle details to be deleted.
   * @returns Observable containing the response from the server.
   */
  deleteVehicle(vehicleData: {
    year: string;
    make: string;
    model: string;
    trim: string;
    engine: string;
    customerID: number;
  }): Observable<DeleteResponse> {
    return this.apiService.post<DeleteResponse>('Customers/deleteVehicle', vehicleData);
  }
}
