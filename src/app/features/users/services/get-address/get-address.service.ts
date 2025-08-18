import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GetAddressService {
  constructor(private apiService: ApiService) {}

  // Corrected Method to get addresses of a customer by customerId
  getAddresses(customerId: number): Observable<any> {
    // ✅ Construct the correct API URL with customerId in query parameter
    const requestUrl = `Customers/GetAddressesByCustomerId?customerId=${customerId}`;
  
    // ✅ Log the correct request details
    console.log("🚀 API Request:");
    console.log("➡️ URL:", requestUrl);
    console.log("📤 Request Data:", { customerId });
  
    // ✅ Send POST request (Even though it's usually for sending data, we'll use it as required)
    return this.apiService.post<any>(requestUrl, {}).pipe(
      catchError(error => {
        console.error('❌ API error:', error);
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  }
  
  
  
  // Method to handle API error messages
  private getErrorMessage(error: any): string {
    if (error.error && error.error.errors) {
      return Object.entries(error.error.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return error.message || 'An unknown error occurred while fetching addresses';
  }
}
