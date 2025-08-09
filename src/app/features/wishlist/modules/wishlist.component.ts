import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { RemoveFromWishlistService } from '../../core/services/remove-from-wishlist/remove-from-wishlist.service';
import { CartService } from '../../core/services/cart/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  wishlistItems: Array<{
    product_id: number;
    product_name: string; 
    product_price: number;
    product_quantity: number;
    product_image: string;
    imageError: boolean;
    discounts_Seller?: Array<{
      id: number;
      product_id: number;
      quantity: number;
      amount: number;
      percentage: number | null;
      customer_type: string;
    }>;
  }> = [];

  businessId: number | null = null;
  showNotification: boolean = false; // To control notification visibility
  notificationMessage: string = '';  // Notification message text

  constructor(
    private wishlistService: WishlistService,
    private removeFromWishlistService: RemoveFromWishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Set the business ID from the user ID
    this.businessId = this.wishlistService.getUserID() ? +this.wishlistService.getUserID()! : null;

    // If businessId is available, load the wishlist data
    if (this.businessId !== null) {
      this.loadWishlistData();
    } else {
      console.error('Business ID (userID) is not set.');
    }
  }

  askForQuery(product: any): void {
    // Example: Open a contact support page or trigger an inquiry form
    console.log('User wants to inquire about:', product.product_name);
  
    // Show a temporary pop-up
    // this.showTemporaryPopup('Inquiry sent for ' + product.product_name, '#f39c12');
  
    // You can redirect the user to an inquiry page or open a modal here
  }
  

  loadWishlistData(): void {
    if (!this.businessId) {
      console.error('Business ID is not available.');
      return;
    }

    // Fetch wishlist details from the service
    this.wishlistService.getWishlistDetailsByBusinessId(this.businessId).subscribe(
      (data) => {
        console.log('Fetched wishlist details:', data);

        // Map the products array to wishlistItems
        this.wishlistItems = data.products.map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name || 'Unknown Product',
          product_price: item.product_price || 0,
          product_quantity: item.product_quantity || 0,
          product_image: item.product_image || '/assets/images/placeholder.png',
          imageError: false,
          discounts_Seller: item.discounts_Seller || [],
        }));
      },
      (error) => {
        console.error('Error fetching wishlist details:', error);
      }
    );
  }

  handleImageError(item: any): void {
    console.log('Image failed to load:', item.product_image);
    item.imageError = true;
    item.product_image = '/assets/images/placeholder.png'; // Placeholder image in case of error
  }

  onQuantityInput(productId: number, event: any): void {
    const updatedQuantity = +event.target.value;
    console.log(`Updated quantity for product ${productId}: ${updatedQuantity}`);
  }

  onRemove(productId: number): void {
    if (!this.businessId) {
      console.error('Business ID is not available.');
      return;
    }

    this.removeFromWishlistService
      .removeFromWishlist(0, this.businessId, productId) // Assuming customerId is 0 here
      .subscribe({
        next: () => {
          console.log('Product removed successfully');
          // Remove product from wishlistItems array after successful API response
          this.wishlistItems = this.wishlistItems.filter((product) => product.product_id !== productId);
        },
        error: (err: any) => console.error('Error removing product:', err),
      });
  }

  moveToCart(product: any): void {
    // Call CartService to add the product to the cart
    this.cartService.addToCart(product);

    // Show notification
    this.notificationMessage = 'Added to cart successfully';
    this.showNotification = true;

    // Hide notification after 3 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);

    // Optionally remove from wishlist after moving to cart
    this.onRemove(product.product_id);
  }
}
