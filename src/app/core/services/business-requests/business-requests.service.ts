import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessRequestsService {
  constructor(private apiService: ApiService) {}

  getBusinessRequests(requestData: any = {}): Observable<any[]> {
    return this.apiService.post<any[]>('Customers/getBusinessRequests', requestData);
  }
}
