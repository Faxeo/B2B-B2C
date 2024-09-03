import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PendingOrder {
  orderID: number;
  orderDate: string;
  totalAmount: number;
  totalQuantity: number;
  orderStatus: string;
  customerName: string | null;
  transactionID: string;
  orderTracking: string;
} 

interface PendingOrdersResponse {
  data: PendingOrder[];
}

@Injectable({
  providedIn: 'root'
})
export class PendingOrdersService {
  constructor(private apiService: ApiService) {}

  getPendingOrders(): Observable<PendingOrder[]> { 
    return this.apiService.post<PendingOrdersResponse>('/Order/getPendingOrders', {}).pipe(
      map((response) => response.data)
    );
  }
  
} 