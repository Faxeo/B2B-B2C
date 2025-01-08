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

getItemTotal(item: { productId: string; price: number; quantity: number; discountedPrice?: number; discounts_Seller?: any[] }): number {
  const customerType = 'Bronze'; // Adjust customer type as needed
  const discountedPrice = this.applyDiscount(item, item.quantity, customerType);
  item.discountedPrice = discountedPrice; // Store discounted price in item
  return discountedPrice;
}

applyDiscount(product: any, prod_qty: number, customerType: string): number {
  // Log the initial request data
  console.log('applyDiscount called with:');
  console.log('Product:', product);
  console.log('Quantity:', prod_qty);
  console.log('Customer Type:', customerType);

  // Check if discounts_Seller array is present and not empty
  if (!product.discounts_Seller || product.discounts_Seller.length === 0) {
    console.log('No discounts available for this product.');
    return product.price * prod_qty; // Return original price if no discounts available
  }

  // Filter discounts based on the customer type
  const discounts = product.discounts_Seller.filter((d: any) => d.customer_type === customerType);
  console.log('Filtered Discounts for Customer Type:', discounts);

  if (discounts.length === 0) {
    console.log(`No discounts applicable for customer type: ${customerType}`);
    return product.price * prod_qty; // No discount applicable for this customer type
  }

  // Sort the discounts by quantity in ascending order to apply the "up to" logic
  discounts.sort((a: any, b: any) => a.quantity - b.quantity);
  console.log('Sorted Discounts by Quantity:', discounts);

  let applicableDiscountAmount = 0;

  // Loop through each discount tier and apply the correct discount "up to" the quantity
  for (let i = 0; i < discounts.length; i++) {
    const discount = discounts[i];
    const nextDiscountTier = i + 1 < discounts.length ? discounts[i + 1].quantity : Infinity;

    console.log(`Checking Discount Tier: ${discount.quantity} - Amount: ${discount.amount}`);
    console.log(`Next Discount Tier Quantity: ${nextDiscountTier}`);

    // Apply discount if the quantity is within the current range
    if (prod_qty <= discount.quantity) {
      applicableDiscountAmount = discount.amount;
      console.log(`Applicable Discount Found for Quantity: ${prod_qty} - Discount Amount: ${discount.amount}`);
      break; // Break as we found the applicable discount tier
    }

    // If quantity is in the next tier range, apply the discount of the current tier
    if (prod_qty > discount.quantity && prod_qty < nextDiscountTier) {
      applicableDiscountAmount = discount.amount;
      console.log(`Applicable Discount for Quantity in Range: ${discount.quantity} to ${nextDiscountTier} - Discount Amount: ${discount.amount}`);
    }
  }

  // Calculate the total price considering the applicable discount amount
  const originalTotal = product.price * prod_qty;
  const discountedTotal = originalTotal - applicableDiscountAmount * prod_qty;

  // Log final calculation details
  console.log('Original Total Price:', originalTotal);
  console.log('Discount Amount per Unit:', applicableDiscountAmount);
  console.log('Discounted Total Price:', discountedTotal);

  return discountedTotal;
}



handleImageError(item: any): void {
  console.log('Image failed to load:', item.image);
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
  // this.router.navigate(['/cart/checkout']);
}

}
