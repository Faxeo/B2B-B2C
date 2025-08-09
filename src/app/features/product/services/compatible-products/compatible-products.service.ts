import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompatibleProductsService {
  constructor(private apiService: ApiService) {}

  // Method to fetch compatible products
  getCompatibleProducts(requestData: any): Observable<any[]> {
    return this.apiService.post<any[]>('Product/getCompatibleProducts', requestData);
  }
}
