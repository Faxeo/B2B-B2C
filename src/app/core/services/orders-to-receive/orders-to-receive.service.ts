import { Injectable } from '@angular/core';
import { ApiService } from '../api.service'; // Adjust the path as necessary
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersToReceiveService {
  constructor(private apiService: ApiService) {}

  getBusinessShippedOrders(requestData: any = {}): Observable<any> {
    return this.apiService.post<any>('/Order/getBusinessShippedOrders', requestData);
  }
}
