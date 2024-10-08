import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BusinessCartService {

  // Define the base URL for the API
  private baseUrl = 'https://sanwasystems.azurewebsites.net/api/Cart';

  constructor(private http: HttpClient) { }

  /**
   * Fetch cart details by business ID
   * @param businessId - ID of the business
   * @returns Observable of the cart details
   */
  getCartDetailsByBusinessId(businessId: number): Observable<any> {
    const url = `${this.baseUrl}/getCartDetailsByBusinessId/${businessId}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleError) // Handle any errors that occur during the HTTP request
    );
  }

  /**
   * Handle HTTP errors
   * @param error - The error response from the HTTP request
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
