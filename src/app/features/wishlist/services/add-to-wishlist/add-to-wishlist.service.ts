import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartService } from '../../../../features/cart/services/cart/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AddToWishlistService {
  constructor(private apiService: ApiService, private cartService: CartService) {}

  // Method to send the add to wishlist request to the API
  addToWishlist(productId: number, userID: string, businessId: number): Observable<any> {
    const payload = {
      productIds: [productId],
      customerId: 0,
      businessID: businessId
    };
    console.log('Sending product to wishlist:', payload);
  
    return this.apiService.post<any>('Wishlist/add', payload).pipe(
      catchError(error => {
        console.error('Error adding to wishlist:', error);
        return throwError(() => new Error('Error adding to wishlist'));
      })
    );
  }
  

  // Method to update the wishlist locally
  // updateWishlist(productId: string, name: string, price: number, image: string, quantity: number, upc: string): void {
  //   console.log('Updating wishlist with quantity and UPC:', quantity, upc);

  //   this.cartService.addToCart({
  //     productId,
  //     name,
  //     price,
  //     image,
  //     quantity,
  //     upc
  //   });
  // }

  // Method to handle API error messages
  // private getErrorMessage(error: any): string {
  //   if (error.error && error.error.errors) {
  //     return Object.entries(error.error.errors)
  //       .map(([key, value]) => `${key}: ${value}`)
  //       .join(', ');
  //   }
  //   return error.message || 'An unknown error occurred while adding the item to the wishlist';
  // }
}
