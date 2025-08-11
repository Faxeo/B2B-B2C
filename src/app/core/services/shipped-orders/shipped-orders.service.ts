import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ShippedOrdersResponse {
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ShippedOrdersService {
  constructor(private apiService: ApiService) {}

  getShippedOrders(): Observable<any[]> {
    return this.apiService.post<ShippedOrdersResponse>('Order/getShippedOrders', {}).pipe(
      map((response) => {
        return response.data;
      })
    );
  }
}