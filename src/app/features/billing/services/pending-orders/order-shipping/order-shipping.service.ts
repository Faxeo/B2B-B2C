import { Injectable } from '@angular/core';
import { ApiService } from '../.../../../../../../shared/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface OrderShipping {
  id: number;
  shippingName: string  ;
  shippingEmail: string;
  address: string;
  city: string;
  country: string;
  state: string;
  zipCode: string;
  contact: string;
  customerID: number | null;
  businessID: number | null;
  orderID: number;
}

interface OrderShippingResponse {
  data: OrderShipping;
}

@Injectable({
  providedIn: 'root'
})
export class OrderShippingService {
  constructor(private apiService: ApiService) {}

  getOrderShipping(orderId: number): Observable<OrderShipping> {
    return this.apiService.post<OrderShippingResponse>('Order/getOrderShipping', { id: orderId }).pipe(
      map((response) => response.data)
    );
  }
}