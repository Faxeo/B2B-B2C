import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  constructor(private http: HttpClient, private apiService: ApiService) {}

  /**
   * Fetch wishlist details by business ID using POST
   * @param businessId - ID of the business
   * @returns Observable of wishlist details
   */
  getWishlistDetailsByBusinessId(businessId: number): Observable<any> {
    console.log('Sending payload to API:', businessId);

    return this.apiService.post<any>(`Wishlist/GetWishlistDetailsByBusinessId?businessId=${businessId}`, {}).pipe(
      catchError(error => {
        console.error('API error:', error);
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  }

  /**
   * Remove a product from the wishlist
   * @param productId - Product ID
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Observable of the removal response
   */
  removeFromWishlist(productId: number, customerId: number, businessId: number): Observable<any> {
    const payload = {
      customerId: customerId,
      businessId: businessId,
      productId: productId
    };

    return this.apiService.post<any>(`Wishlist/removeProductFromWishlist`, payload).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Error removing product from wishlist'));
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error.message || 'An unknown error occurred';
  }

  removeItem(productId: string): void {
    console.log(`Removing item with ID: ${productId}`);
  }

  updateQuantity(productId: string, quantity: number): void {
    console.log(`Updating quantity for item with ID: ${productId} to ${quantity}`);
  }

  getUserID(): string | null {
    return localStorage.getItem('userID');
  }
}
