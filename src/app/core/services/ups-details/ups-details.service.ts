import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpsDetailsService {
  constructor(private apiService: ApiService) {}

  // Send tracking number as a query parameter in the POST request
  trackUpsOrder(trackingNumber: string): Observable<any> {
    const endpoint = `ThirdParty/trackUpsOrder?trackingNumber=${trackingNumber}`; // Append query param to endpoint
    const requestBody = {}; // Empty body since trackingNumber is passed as a query parameter
    return this.apiService.post<any>(endpoint, requestBody); // POST with an empty body
  }
}
