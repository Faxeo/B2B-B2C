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
   * Deletes a vehicle based on the provided vehicle ID.
   * @param vehicleId - The ID of the vehicle to be deleted.
   * @returns Observable containing the response from the server.
   */
  deleteVehicle(vehicleId: number): Observable<DeleteResponse> {
    const requestBody = { vehicleID: vehicleId };
    return this.apiService.post<DeleteResponse>('Customers/deleteVehicle', requestBody);
  }
}
