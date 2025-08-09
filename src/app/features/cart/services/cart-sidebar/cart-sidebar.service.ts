import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartSidebarService {
  private cartSidebarState = new BehaviorSubject<boolean>(false); // Initial state: closed
  cartSidebarState$ = this.cartSidebarState.asObservable();

  constructor() {}

  openCartSidebar(): void {
    this.cartSidebarState.next(false); // Open the cart sidebar
  }

  closeCartSidebar(): void {
    this.cartSidebarState.next(true); // Close the cart sidebar
  }
}
