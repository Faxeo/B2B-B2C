import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RemoveFromWishlistService {
  constructor(private apiService: ApiService) {}

  // Method to remove product from wishlist
  removeFromWishlist(customerId: number, businessId: number, productId: number): Observable<any> {
    const payload = {
      customerId: 0,
      businessId: businessId,
      productId: productId
    };
    console.log('Sending remove product to API:', payload);
  
    return this.apiService.post<any>('Wishlist/removeProductFromWishlist', payload).pipe(
      catchError(error => {
        console.error('Error removing from wishlist:', error);
        return throwError(() => new Error('Error removing from wishlist'));
      })
    );
  }
  
}
