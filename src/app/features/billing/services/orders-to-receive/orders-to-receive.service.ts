import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersToReceiveService {
  constructor(private apiService: ApiService) {}

  getBusinessShippedOrders(requestData: any = {}): Observable<any> {
    return this.apiService.post<any>('Order/getBusinessShippedOrders', requestData);
  }
}
