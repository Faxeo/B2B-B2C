import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart/cart.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessCartService } from '../../core/services/business-cart/business-cart.service';
import { DeleteCartService } from '../../core/services/delete-cart/delete-cart.service';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';


@Component({
  standalone: true, 
  imports: [CommonModule, FormsModule],
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css']
})
 
export class CartSidebarComponent implements OnInit, OnDestroy  {
 // Define the type for cartItems, adding cartId and discountedPrice as optional fields
 private cartSub!: Subscription;

 cartItems: Array<{
  cartId: string; // Add cartId for deletion
  productId: string;
  upc: string;
  name: string;
  quantity: number;
  price: number;
  discountedPrice?: number; // Added field to store discounted price
  image: string;
  imageError: boolean;
  discounts_Seller?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    amount: number;
    percentage: number | null;
    customer_type: string;
  }>; // Optional discounts_Seller array to handle products without discounts
}> = [];


businessId: number | null = null;
isSidebarVisible: boolean = true;

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
  private businessCartService: BusinessCartService,
  private router: Router,
  private cdr: ChangeDetectorRef,
  private deleteCartService: DeleteCartService,
) {}

ngOnInit(): void {
  this.businessId = this.cartService.getUserID() ? +this.cartService.getUserID()! : null;

  if (this.businessId !== null) {
    this.loadCartData(); // Fetch cart data if businessId is available
     this.cartSub = this.cartService.cartItems$.subscribe(_ => {
        this.loadCartData();
      });
  } else {
    console.error('Business ID (userID) is not set.');
  }
}

toggleSidebar() {
  this.isSidebarVisible = !this.isSidebarVisible;
}


ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

calculateSubtotal(): number {
  return this.cartItems.reduce((sum, item) => sum + this.getItemTotal(item), 0);
}

goToCart(): void {
  this.router.navigate(['/B2B/cart']);
}

  closeCartSidebar(): void {
    this.isSidebarVisible = false; // Set visibility to false to close the sidebar
    console.log('Sidebar closed.');
  }

getItemTotal(item: { productId: string; price: number; quantity: number; discountedPrice?: number; discounts_Seller?: any[] }): number {
  const customerType = 'Bronze'; // Adjust customer type as needed
  const discountedPrice = this.applyDiscount(item, item.quantity, customerType);
  item.discountedPrice = discountedPrice; // Store discounted price in item
  return discountedPrice;
}

// Fetch the cart data from the server
loadCartData(): void {
  if (!this.businessId) {
    // console.error('Business ID is not available.');
    return;
  }
  this.businessCartService.getCartDetailsByBusinessId(this.businessId).subscribe(
    (data) => {
      // console.log('Fetched cart details:', data);
      this.cartItems = data.map((item: any) => ({
        cartId: item.cart_id, // Include cartId for each item
        productId: item.product.product_id.toString(),
        name: item.product.product_name,
        quantity: item.prod_qty,
        price: item.product.product_price,
        image: item.product.product_image,
        upc: item.product.product_identifier2,
        imageError: false,
        discounts_Seller: item.product.discounts_Seller || [], // Include discounts if available
      }));
      // Log all cart items after loading
      console.log('Loaded cart items:', this.cartItems);
      // Update each item with its discounted price
      this.cartItems.forEach(item => this.getItemTotal(item));
    },
    (error) => {
      console.error('Error fetching cart details:', error);
    }
  );
}

// Remove a product from the cart using the cartId
removeFromCart(cartId: string): void {
  Swal.fire({
    title: 'Remove item from cart',
    text: 'This product will no longer appear in your cart.',
    icon: 'warning', // You can also use 'question' or 'info' if preferred
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Remove',
    cancelButtonText: 'Keep it',
    reverseButtons: true,
    backdrop: true,
    focusCancel: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.deleteCartService.deleteCart(+cartId).subscribe(
        (response) => {
          if (response.success) {
            this.cartItems = this.cartItems.filter(item => item.cartId !== cartId);
            Swal.fire({
              icon: 'success',
              title: 'Item removed',
              text: 'The product was removed from your cart.',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Removal failed',
              text: response.statusReason || 'Could not remove the item.',
            });
          }
        },
        (error) => {
          console.error('Delete error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            text: 'Unable to remove the item. Please try again.',
          });
        }
      );
    }
  });
}


applyDiscount(product: any, prod_qty: number, customerType: string): number {
  // console.log('applyDiscount called with: Product:', product, 'Quantity:', prod_qty, 'Customer Type:', customerType);
  if (!product.discounts_Seller || product.discounts_Seller.length === 0) {
    return product.price * prod_qty; // Return original price if no discounts available
  }

  const discounts = product.discounts_Seller.filter((d: any) => d.customer_type === customerType);
  if (discounts.length === 0) {
    return product.price * prod_qty; // No discount applicable for this customer type
  }

  discounts.sort((a: any, b: any) => a.quantity - b.quantity);

  let applicableDiscountAmount = 0;

  for (let i = 0; i < discounts.length; i++) {
    const discount = discounts[i];
    const nextDiscountTier = i + 1 < discounts.length ? discounts[i + 1].quantity : Infinity;

    if (prod_qty <= discount.quantity) {
      applicableDiscountAmount = discount.amount;
      break;
    }

    if (prod_qty > discount.quantity && prod_qty < nextDiscountTier) {
      applicableDiscountAmount = discount.amount;
    }
  }

  const originalTotal = product.price * prod_qty;
  const discountedTotal = originalTotal - applicableDiscountAmount * prod_qty;

  return discountedTotal;
}

handleImageError(item: any): void {
  console.log('Image failed to load:', item.image);
  item.imageError = true;
  item.image = '/assets/images/placeholder.png';
}

onQuantityInput(productId: string, event: any): void {
const updatedQuantity = Math.max(+event.target.value, 1); // Ensure quantity is at least 1
this.updateQuantity(productId, updatedQuantity);
}

updateQuantity(productId: string, newQuantity: number): void {
newQuantity = Math.max(newQuantity, 1); // Prevent negative or zero quantities
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

get isBillingValid(): boolean {
    const b = this.billing;
    return !!(
      b.fullName.trim() &&
      b.email.trim() &&
      b.contact.trim() &&
      b.billingAddress.trim() &&
      b.state.trim() &&
      b.city.trim() &&
      b.zipcode.trim()
    );
  }

saveBillingDetails(): void {
  console.log('Billing details saved:', this.billing);
  this.cartService.saveBillingDetails(this.billing);
  localStorage.setItem('billingDetails', JSON.stringify(this.billing));
}

goToCheckout(): void {
  // Save billing details before navigating to checkout
  this.saveBillingDetails(); 
  console.log('Billing details saved before going to checkout:', this.billing);

  // Save cart items to localStorage
  const cartItemsToSave = this.cartItems.map(item => ({
    productId: item.productId,
    name: item.name,
    upc: item.upc,
    quantity: item.quantity,
    price: item.price,
    discountedPrice: item.discountedPrice || item.price, // Include discounted price or original if no discount
    image: item.image,
  }));

  // Log cart items to be saved
  // console.log('Cart Items before saving to storage:', cartItemsToSave);

  localStorage.setItem('cartItems', JSON.stringify(cartItemsToSave));

  // Navigate to the CheckoutComponent
  this.router.navigate(['/B2B/cart/checkout']);
}

}
