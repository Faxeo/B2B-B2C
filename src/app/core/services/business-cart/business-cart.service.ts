import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service'; 

@Injectable({
  providedIn: 'root'
})
export class BusinessCartService {

  constructor(private apiService: ApiService) {}

  /**
   * Fetch cart details by business ID using POST with query parameter
   * @param businessId - ID of the business
   * @returns Observable of the cart details
   */
  getCartDetailsByBusinessId(businessId: number): Observable<any> {
    return this.apiService.post<any>(`Cart/getCartDetailsByBusinessId?businessId=${businessId}`, {});
  }
}
