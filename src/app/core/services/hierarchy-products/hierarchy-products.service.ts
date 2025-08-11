import { Injectable } from '@angular/core';
import { ApiService } from '../api.service'; // Assuming you have an ApiService for HTTP requests
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HierarchyProductsService {

  constructor(private apiService: ApiService) {}

  // Function to fetch products based on category with pagination
  getHierarchyProducts(requestData: { m_id: number, f_id?: number, s_id?: number, page: number, pageSize: number }): Observable<any> {
    return this.apiService.post<any>('Product/getHierarchyProducts', requestData);
  }
}
