import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../core/config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = AppConfig.baseUrl;
  // private baseUrl1 = AppConfig.baseUrl1;

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`);
  }
  
  post<T>(url: string, data: any): Observable<T> {
    // console.log('Posting to:', `${this.baseUrl}/${url}`, data); 
    return this.http.post<T>(`${this.baseUrl}/${url}`, data);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${url}`);
  }

  // Fetch main categories
  getMainCategory(): Observable<any> {
    return this.post<any>('Product/getMainCategory', {});
  }

  // Fetch products
  getProducts(): Observable<any[]> {
    return this.post<any[]>('Product/getProducts', {});
  }

  getSubCategories(parentID: number): Observable<any[]> {
    const requestData = {
      level: 1, 
      parentID: parentID
    };
    return this.post<any[]>('Product/getSubCategories', requestData);
  }

  // Get Top Selling Products
  getTopSellingProducts(): Observable<any[]> {
    return this.post<any[]>('Product/getTopSellingProducts', {});
  }
}
