import { ChangeDetectorRef, Component } from '@angular/core';
import { CartService } from '../../../../core/services/cart/cart.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerCartService } from '../../../../core/services/customer-cart/customer-cart.service';

@Component({
  selector: 'app-b2c-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './b2c-cart.component.html',
  styleUrl: './b2c-cart.component.css'
})

export class B2cCartComponent {
  cartItems: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    discountedPrice?: number;
    image: string;
    imageError: boolean;
    product_origin?: string;  // Add product_origin
    prod_qty?: number;        // Add prod_qty
    discounts_Seller?: Array<{
      id: number;
      product_id: number;
      quantity: number;
      amount: number;
      percentage: number | null;
      customer_type: string;
    }>;
  }> = [];
  

customerId: number | null = null;

billing = {
  fullName: '',
  email: '',
  contact: '',
  billingAddress: '',
  country: 'United States',
  state: '',
  city: '',
  zipcode: '',
};

constructor(
  private cartService: CartService,
  private customerCartService: CustomerCartService,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

ngOnInit(): void {
  // Set customerId if the user is logged in; otherwise, keep it null
  this.customerId = this.cartService.getUserID() ? +this.cartService.getUserID()! : null;

  if (this.customerId !== null) {
    // Load cart from server for logged-in user
    this.loadCartData();
  } else {
    console.log('User is not logged in. Loading guest cart items from local storage.');
    this.loadGuestCartData(); // Load guest cart data
  }
}


loadGuestCartData(): void {
  // Get the cart items and add the missing properties to match the expected type
  this.cartItems = this.cartService.getCartItems().map(item => ({
    ...item,
    prod_qty: item.quantity,
    imageError: false,
  }));

  console.log('Loaded guest cart items:', this.cartItems);
  this.cdr.detectChanges();
}

loadCartData(): void {
  if (!this.customerId) {
    console.error('Customer ID is not available.');
    return;
  }

  this.customerCartService.getCartDetailsByCustomerId(this.customerId).subscribe(
    (data) => {
      console.log('Fetched cart details:', data);
      this.cartItems = data.map((item: any) => ({
        productId: item.product.product_id.toString(),
        name: item.product.product_name,
        price: item.product.product_price,
        image: item.product.product_image,
        product_origin: item.product.product_origin,  // Flatten product origin
        prod_qty: item.prod_qty,                      // Flatten prod_qty
        imageError: false,
        discounts_Seller: item.product.discount || [], // Flatten discount array
      }));
      this.cartItems.forEach(item => this.getItemTotal(item));  // Apply discounts after loading
    },
    (error) => {
      console.error('Error fetching cart details:', error);
    }
  );
}



calculateSubtotal(): number {
  return this.cartItems.reduce((sum, item) => sum + this.getItemTotal(item), 0);
}

getItemTotal(item: { productId: string; price: number; prod_qty?: number; discountedPrice?: number; discounts_Seller?: any[] }): number {
  const customerType = 'Bronze'; // Adjust customer type as needed
  const discountedPrice = this.applyDiscount(item, item.prod_qty ?? 0, customerType);
  item.discountedPrice = discountedPrice; // Store discounted price in item
  return discountedPrice;
}

applyDiscount(product: any, prod_qty: number, customerType: string): number {
  // Check if discounts_Seller array is present and not empty
  if (!product.discounts_Seller || product.discounts_Seller.length === 0) {
    console.log('No discounts available for this product.');
    return product.price * prod_qty; // Return original price if no discounts available
  }

  // Filter discounts based on the customer type
  const discounts = product.discounts_Seller.filter((d: any) => d.customer_type === customerType);

  if (discounts.length === 0) {
    return product.price * prod_qty; // No discount applicable for this customer type
  }

  // Sort the discounts by quantity in ascending order to apply the "up to" logic
  discounts.sort((a: any, b: any) => a.quantity - b.quantity);

  let applicableDiscountAmount = 0;

  // Loop through each discount tier and apply the correct discount "up to" the quantity
  for (let i = 0; i < discounts.length; i++) {
    const discount = discounts[i];
    const nextDiscountTier = i + 1 < discounts.length ? discounts[i + 1].quantity : Infinity;

    // Apply discount if the quantity is within the current range
    if (prod_qty <= discount.quantity) {
      applicableDiscountAmount = discount.amount;
      break; // Break as we found the applicable discount tier
    }

    // If quantity is in the next tier range, apply the discount of the current tier
    if (prod_qty > discount.quantity && prod_qty < nextDiscountTier) {
      applicableDiscountAmount = discount.amount;
    }
  }

  // Calculate the total price considering the applicable discount amount
  const originalTotal = product.price * prod_qty;
  const discountedTotal = originalTotal - applicableDiscountAmount * prod_qty;

  return discountedTotal;
}



handleImageError(item: any): void {
  item.imageError = true;
  item.image = '/assets/images/placeholder.png';
}

removeFromCart(productId: string): void {
  this.cartService.removeItem(productId);
  this.cartItems = this.cartItems.filter((item) => item.productId !== productId);
  // this.loadCartData();
}

onQuantityInput(productId: string, event: any): void {
  const updatedQuantity = +event.target.value;
  if (updatedQuantity > 0) {
    this.updateQuantity(productId, updatedQuantity);
  }
}

updateQuantity(productId: string, newQuantity: number): void {
  if (newQuantity > 0) {
    this.cartService.updateQuantity(productId, newQuantity);

    const itemToUpdate = this.cartItems.find((item) => item.productId === productId);
    if (itemToUpdate) {
      itemToUpdate.quantity = newQuantity;
      itemToUpdate.discountedPrice = this.applyDiscount(itemToUpdate, newQuantity, 'Bronze'); // Update discounted price
    }

    this.cdr.detectChanges(); // Trigger change detection manually if needed
  }
}

saveBillingDetails(): void {
  console.log('Billing details saved:', this.billing);
  this.cartService.saveBillingDetails(this.billing);
}

goToCheckout(): void {
  if(this.billing.fullName == '' || this.billing.email == '' || this.billing.contact == '' || this.billing.billingAddress == '' || this.billing.state == '' || this.billing.city == '' || this.billing.zipcode == '') {
    return;
  }
  // Save billing details before navigating to checkout
  this.saveBillingDetails(); 

  // Log the billing details to verify the structure

  // Save cart items to localStorage
  const cartItemsToSave = this.cartItems.map(item => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    discountedPrice: item.discountedPrice || item.price, // Include discounted price or original if no discount
    image: item.image,
  }));

  // Log cart items to be saved
  console.log('Cart Items before saving to storage:', cartItemsToSave);

  localStorage.setItem('cartItems', JSON.stringify(cartItemsToSave));

  // Navigate to the CheckoutComponent
  this.router.navigate(['B2C/checkout']);
}

handleAddressPaste(event: ClipboardEvent): void {
  event.preventDefault(); // Prevent default paste action

  const clipboardData = event.clipboardData || (window as any).clipboardData;
  const pastedText = clipboardData.getData('text');

  // Set the pasted text to the billing address field
  this.billing.billingAddress = pastedText;

  // Extract address details using a regex or keywords
  const addressParts = this.extractAddressDetails(pastedText);

  // Auto-fill city, state, and zip code if found
  if (addressParts.city) {
    this.billing.city = addressParts.city;
  }
  if (addressParts.state) {
    this.billing.state = addressParts.state;
  }
  if (addressParts.zipcode) {
    this.billing.zipcode = addressParts.zipcode;
  }
}

extractAddressDetails(address: string): { city?: string; state?: string; zipcode?: string } {
  const result: { city?: string; state?: string; zipcode?: string } = {};

  // Regex patterns to detect ZIP code, state abbreviations, and city names
  const zipRegex = /\b\d{5}(-\d{4})?\b/; // Matches US ZIP codes (12345 or 12345-6789)
  const stateRegex = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/;
  const addressParts = address.split(',');

  // Extract ZIP code
  const zipMatch = address.match(zipRegex);
  if (zipMatch) {
    result.zipcode = zipMatch[0];
  }

  // Extract state
  const stateMatch = address.match(stateRegex);
  if (stateMatch) {
    result.state = stateMatch[0];
  }

  // Extract city (assuming it appears **before** the state)
  if (stateMatch) {
    const stateIndex = addressParts.findIndex((part) => part.includes(stateMatch[0]));
    
    if (stateIndex > 0) {
      // The city is usually the part **right before the state**
      result.city = addressParts[stateIndex - 1].trim();
    }
  }

  return result;
}
}
