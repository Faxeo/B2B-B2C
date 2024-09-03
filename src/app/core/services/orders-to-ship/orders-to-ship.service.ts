import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersToShipService {
  constructor(private apiService: ApiService) {}

  getOrdersToShip(requestData: any = {}): Observable<any[]> {
    return this.apiService.post<any[]>('/Order/getBusinessPendingOrders', requestData);
  }
}
