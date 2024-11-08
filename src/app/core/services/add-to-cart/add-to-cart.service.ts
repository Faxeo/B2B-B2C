import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartService } from '../cart/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AddToCartService {
  constructor(private apiService: ApiService, private cartService: CartService) {}

  // Method to send the add to cart request to the API with updated structure
  addToCart(productId: number, userID: string, businessId: number, quantity: number): Observable<any> {
    const payload = {
      productID: productId,
      customerID: +userID, //+userID
      businessId: businessId,
      quantity: quantity
    };

    console.log('Sending payload to API:', payload);

    return this.apiService.post<any>('Cart/addToCart', payload).pipe(
      catchError(error => {
        console.error('API error:', error);
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  }

  updateCart(productId: string, name: string, price: number, image: string, quantity: number, upc: string): void {
    console.log('Updating cart with quantity and UPC:', quantity, upc);

    this.cartService.addToCart({
      productId,
      name,
      price,
      image,
      quantity,
      upc 
    });
  }

  // Method to handle API error messages
  private getErrorMessage(error: any): string {
    if (error.error && error.error.errors) {
      return Object.entries(error.error.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return error.message || 'An unknown error occurred while adding the item to the cart';
  }
}