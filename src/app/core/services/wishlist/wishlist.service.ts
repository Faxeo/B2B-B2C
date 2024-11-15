import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  constructor(private http: HttpClient,private apiService: ApiService) { }
 
  getWishlistDetailsByBusinessId(businessId: number): Observable<any> {
    console.log('Sending payload to API:', businessId);

    return this.apiService.get<any>(`Wishlist/GetWishlistDetailsByBusinessId/${businessId}`).pipe(
      catchError(error => {
        console.error('API error:', error);
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  
  }
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
    // Logic to remove item from wishlist
    console.log(`Removing item with ID: ${productId}`);
  }

  updateQuantity(productId: string, quantity: number): void {
    // Logic to update quantity of item in wishlist
    console.log(`Updating quantity for item with ID: ${productId} to ${quantity}`);
  }

  // Implementing getUserID to retrieve the business/user ID
  getUserID(): string | null {
    // Here, we assume the user ID is stored in localStorage with the key 'userID'
    return localStorage.getItem('userID'); // You can replace this with your logic to get the user ID
  }
}
