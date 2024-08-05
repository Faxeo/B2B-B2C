import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = AppConfig.baseUrl;

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`);
  }

  post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${url}`, data);
  }

  // Fetch main categories
  getMainCategory(): Observable<any> {
    return this.post<any>('Product/getMainCategory', {});
  }

  // Fetch products
  getProducts(): Observable<any[]> {
    return this.post<any[]>('Product/getProducts', {});
  }

  // Add other methods (put, delete) as needed
}
