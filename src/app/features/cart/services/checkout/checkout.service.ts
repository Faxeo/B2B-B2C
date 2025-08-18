import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';  
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  constructor(private apiService: ApiService) {}

  processCheckout(checkoutData: any): Observable<any> {
    return this.apiService.post<any>('Cart/checkout', checkoutData);
  }
}
