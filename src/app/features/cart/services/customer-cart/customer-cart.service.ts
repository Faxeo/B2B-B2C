import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../shared/api.service'; 

@Injectable({
  providedIn: 'root'
})
export class CustomerCartService {

  constructor(private apiService: ApiService) {}

  /**
   * Fetch cart details by customer ID using POST with query parameter
   * @param customerId - ID of the customer
   * @returns Observable of the cart details
   */
  getCartDetailsByCustomerId(customerId: number): Observable<any> {
    return this.apiService.post<any>(`Cart/getCartDetailsByCustomerId?customerId=${customerId}`, {});
  }
}
