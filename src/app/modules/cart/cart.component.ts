import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutComponent } from './checkout/checkout.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CheckoutComponent],
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})

export class CartComponent implements OnInit {
  cartItems: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    imageError: boolean;
  }> = [];

  
  billing = {
    fullName: '',
    email: '',
    contact: '',
    billingAddress: '',
    country: 'United States',
    state: '',
    city: '',
    zipcode: ''
  };

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items.map(item => ({
        ...item,
        image: item.image,
        imageError: false
      }));
    });
  }

  handleImageError(item: any) {
    console.log('Image failed to load:', item.image);
    item.imageError = true;
    item.image = '/assets/images/placeholder.png';
  }

  removeFromCart(productId: string): void {
    this.cartService.removeItem(productId);
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity > 0) {
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  onQuantityInput(productId: string, event: any) {
    let updatedQuantity = event.target.value;
    if (updatedQuantity > 0) {
      this.cartService.updateQuantity(productId, updatedQuantity);
    }
  }

  calculateSubtotal(): number {
    return this.cartService.calculateSubtotal();
  }

  // Save billing information (you can store this in a service or API)
  saveBillingDetails(): void {
    console.log('Billing details saved:', this.billing);
    this.cartService.saveBillingDetails(this.billing);
  }

  // Navigate to the CheckoutComponent and save billing details
  goToCheckout(): void {
    this.saveBillingDetails();  // Save billing details before navigating to checkout
    this.router.navigate(['/cart/checkout']);
  }
}
