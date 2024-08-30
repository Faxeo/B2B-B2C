import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface OrderDetail {
  orderDetailId: number;
  productId: number;
  quantity: number;
  totalPrice: number | null;
  orderID: number;
  price: number;
  discountedPrice: number;
  trackingLink: string | null;
  deliveryDate: string | null;
  upc: string;
  image: string;
  name: string;
  orderSummary: any;
  // Add the following new properties
  shippingName: string ;
  shippingEmail: string;
  shippingAddress: string;
  customerName: string;
  orderStatus: string;
  trackingChannel: string;
  trackingNumber: string;
}

interface OrderDetailResponse {
  success: boolean;
  statusCode: number;
  statusReason: string;
  data: OrderDetail[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsService {
  constructor(private apiService: ApiService) {}

  getOrderDetail(orderId: number): Observable<OrderDetail> {
    return this.apiService.post<OrderDetailResponse>('/Order/getOrderDetail', { id: orderId }).pipe(
      map((response) => {
        const orderDetail = response.data[0];
        // Add default values for the new properties if they're not present in the API response
        return {
          ...orderDetail,
          shippingName: orderDetail.shippingName || '',
          shippingEmail: orderDetail.shippingEmail || '',
          shippingAddress: orderDetail.shippingAddress || '',
          customerName: orderDetail.customerName || 'Guest',
          orderStatus: orderDetail.orderStatus || 'Pending',
          trackingChannel: orderDetail.trackingChannel || 'USPS',
          trackingNumber: orderDetail.trackingNumber || ''
        };
      })
    );
  }
}