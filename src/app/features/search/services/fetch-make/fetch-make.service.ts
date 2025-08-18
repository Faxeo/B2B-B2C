// fetch-make.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable } from 'rxjs';

// Create an interface that matches the server response fields:
export interface VehicleMake {
  cvalue_id: number;
  value_name: string;
  // Add other fields here if needed
}

@Injectable({
  providedIn: 'root'
})
export class FetchMakeService {
  constructor(private apiService: ApiService) {}

  // Return an array of objects that match VehicleMake
  fetchMakes(year: string): Observable<VehicleMake[]> {
    const requestData = { year };
    return this.apiService.post<VehicleMake[]>('Product/fetchMake', requestData);
  }
}
