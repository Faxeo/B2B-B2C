import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UpsService {
  constructor(private apiService: ApiService) {}

  // Method to fetch UPS token
  getUpsToken(requestData: any): Observable<any> {
    const endpoint = 'ThirdParty/getUpsToken'; // API endpoint
    return this.apiService.post<any>(endpoint, requestData);
  }
}
