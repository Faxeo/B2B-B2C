import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; 
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; 

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    upc?: string;
    userID?: string;
  }>>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSubject.asObservable();

  // Store for billing details
  private billingDetailsSubject = new BehaviorSubject<{
    fullName: string;
    email: string;
    contact: string;
    billingAddress: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
  } | null>(null);
  billingDetails$ = this.billingDetailsSubject.asObservable();

  // New properties to store userID and loginType
  private userID: string | null = null;
  private loginType: string | null = null;

  // Inject PLATFORM_ID into the constructor
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Method to save userID and loginType
  setUserDetails(userID: string | null, loginType: string | null): void {
    this.userID = userID;
    this.loginType = loginType;
  }

  // FIXED: Method to get userID - now decodes token directly and checks platform
  getUserID(): string | null {
    // First try to return the stored userID if available
    if (this.userID) {
      return this.userID;
    }

    // Only access localStorage if in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          console.log('No token found in storage');
          return null;
        }

        // Decode JWT token manually (since you might not have jwt-decode)
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));

        console.log('Decoded token payload:', decoded);

        // Extract the ID from the token
        const extractedId = decoded.id || decoded.userId || decoded.businessId;

        if (extractedId) {
          // Store it for future use
          this.userID = extractedId.toString();
          console.log('Extracted and stored user ID:', this.userID);
          return this.userID;
        }

        console.log('No ID found in token payload');
        return null;

      } catch (error) {
        console.error('Error extracting user ID from token:', error);
        return null;
      }
    }
    return null; // Return null if not in browser environment
  }

  getLoginType(): string | null {
    // First try to return stored loginType
    if (this.loginType) {
      return this.loginType;
    }

    // Only access localStorage if in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          return null;
        }

        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));

        // Extract category as login type
        const extractedType = decoded.category || decoded.loginType || decoded.type;

        if (extractedType) {
          this.loginType = extractedType;
          return this.loginType;
        }

        return null;

      } catch (error) {
        console.error('Error extracting login type from token:', error);
        return null;
      }
    }
    return null; 
  }

  // Modified to accept the UPC field
  addToCart(item: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    upc?: string;  // Optional UPC field
  }): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(i => i.productId === item.productId);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      currentItems.push(item);
    }

    this.cartItemsSubject.next([...currentItems]);
    this.updateCartItemCount();
  }

  getCartItems(): Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    upc?: string;  // Optional UPC field
  }> {
    return this.cartItemsSubject.value;
  }

  updateQuantity(productId: string, newQuantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    const itemToUpdate = currentItems.find(i => i.productId === productId);
    if (itemToUpdate) {
      if (newQuantity > 0) {
        itemToUpdate.quantity = newQuantity;
        this.cartItemsSubject.next([...currentItems]);
        this.updateCartItemCount();
      }
    }
  }

  removeItem(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(i => i.productId !== productId);
    this.cartItemsSubject.next(updatedItems);
    this.updateCartItemCount();
  }

  calculateSubtotal(): number {
    // Calculate subtotal and log each item's total
    let subtotal = 0;

    this.cartItemsSubject.value.forEach(item => {
      const itemTotal = item.price * item.quantity;
      console.log(`Item Total for ${item.name}: $${itemTotal.toFixed(2)}`); // Log each item total
      subtotal += itemTotal;
    });

    return subtotal;
  }

  private updateCartItemCount(): void {
    const totalCount = this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCountSubject.next(totalCount);
  }

  // New method to save billing details
  saveBillingDetails(billingDetails: {
    fullName: string;
    email: string;
    contact: string;
    billingAddress: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
  }): void {
    this.billingDetailsSubject.next(billingDetails);
    console.log('Billing details saved in service:', billingDetails);
  }

  // Optional method to retrieve saved billing details
  getBillingDetails(): {
    fullName: string;
    email: string;
    contact: string;
    billingAddress: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
  } | null {
    return this.billingDetailsSubject.value;
  }
}