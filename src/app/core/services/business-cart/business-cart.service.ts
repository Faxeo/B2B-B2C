import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service'; 

@Injectable({
  providedIn: 'root'
})
export class BusinessCartService {

  constructor(private apiService: ApiService) {}

  /**
   * Fetch cart details by business ID
   * @param businessId - ID of the business
   * @returns Observable of the cart details
   */
  getCartDetailsByBusinessId(businessId: number): Observable<any> {
    return this.apiService.get<any>(`Cart/getCartDetailsByBusinessId/${businessId}`);
  }
}
