import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HierarchyProductsService } from '../../core/services/hierarchy-products/hierarchy-products.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryIdService } from '../../core/services/category-id/category-id.service';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { CartService } from '../../core/services/cart/cart.service';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { FilterComponent } from '../search/filter/filter.component';
import { NavigationService } from '../../core/services/navigation-service/navigation-service.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed/recently-viewed.service';
import { RecentlyViewedComponent } from '../recently-viewed/recently-viewed.component';
import { FilterSearchService } from '../../core/services/filter-search/filter-search.service';
import { AddToWishlistService } from '../../core/services/add-to-wishlist/add-to-wishlist.service';
import { RemoveFromWishlistService } from '../../core/services/remove-from-wishlist/remove-from-wishlist.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    FilterComponent,
    RecentlyViewedComponent,
    RouterModule,
  ],
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit {
  m_id: number | null = null;
  f_id: number | null = null;
  s_id: number | null = null;
  products: any[] = [];
  pageSize: number = 10; // Number of products per page
  currentPage: number = 1;
  totalPages: number = 132;
  isLoading: boolean = true;
  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;
  cartItemCount: number = 0;
  isLocallyLoading: boolean = false;
  notificationMessage: string = ''; // Holds the notification message
  showNotification: boolean = false; // Controls notification visibility
  @Input() loginType: string | null = null;
  isCollapsed: boolean = false;
  showRecentlyViewed: boolean = false;
  isInitialLoad: boolean = true;

  wishlist: number[] = []; // Array to store product IDs in the wishlist
  businessId: number = 123; // Replace with your actual business ID

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private hierarchyProductsService: HierarchyProductsService,
    private categoryIdService: CategoryIdService,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private loginService: LoginService,
    private navigationService: NavigationService,
    private recentlyViewedService: RecentlyViewedService,
    private filterSearchService: FilterSearchService,
    private addToWishlistService: AddToWishlistService,
    private removeFromWishlistService: RemoveFromWishlistService,
    private wishlistService: WishlistService
  ) {
    this.filterSearchService.selectedCategories$.subscribe((categories) => {
      this.m_id = categories.m_id;
      this.f_id = categories.f_id;
      this.s_id = categories.s_id;
      // Fetch products based on updated filter values, starting from page 1
      this.fetchProducts(this.m_id ?? 0, this.f_id ?? 0, this.s_id ?? 0, 1);
    });
  }

  ngOnInit(): void {
    // Retrieve the 'categoryId' from the service
    this.recentlyViewedService.recentlyViewed$.subscribe((products) => {
      this.showRecentlyViewed = products.length > 0;
    });
    const categoryId = this.categoryIdService.getCategoryId();

    if (isPlatformBrowser(this.platformId)) {
      this.userID = localStorage.getItem('userID');
      this.loginService.getUserID().subscribe((userID) => {
        this.userID = userID;
        this.cartService.setUserDetails(this.userID, this.loginType);
      });

      this.loginService.getLoginType().subscribe((loginType) => {
        this.loginType = loginType;
        if (this.loginType === 'business') {
          const username = localStorage.getItem('username');
          this.loginType = username || this.loginType;
        }
        this.cartService.setUserDetails(this.userID, this.loginType);
      });
    }

    // Ensure category ID (m_id) is set correctly
    if (categoryId !== null) {
      this.m_id = categoryId;
      // console.log('CategoryComponent received categoryId:', categoryId);
      this.fetchProducts(this.m_id, 0, 0, this.currentPage);
    } else {
      // console.error('No valid category ID found');
      this.isLoading = false;
    }
    this.loadWishlist();
  }

// Fetch wishlist details
loadWishlist(): void {
  if (!this.userID) return;
  
  this.wishlistService.getWishlistDetailsByBusinessId(this.businessId).subscribe({
    next: (response) => {
      if (response && response.length > 0) {
        const wishlistIds = response.map((item: any) => item.productId);
        this.markWishlistProducts(wishlistIds);
      }
    },
    error: (error) => {
      console.error('Error loading wishlist:', error);
    }
  });
}

markWishlistProducts(wishlistIds: number[]): void {
  this.products = this.products.map(product => ({
    ...product,
    isInWishlist: wishlistIds.includes(product.product_id)
  }));
}

toggleWishlist(product: any): void {
  if (!this.userID) {
    alert('Please log in to manage your wishlist.');
    return;
  }

  if (product.isInWishlist) {
    this.removeFromWishlist(product);
  } else {
    this.addToWishlist(product);
  }
}

addToWishlist(product: any): void {
  if (!this.userID) {
    this.displayNotification('Please log in to add items to wishlist.');
    return;
  }

  this.addToWishlistService
    .addToWishlist(
      product.product_id,
      this.userID,
      Number(this.userID)  // Convert to number for businessId
    )
    .subscribe({
      next: () => {
        product.isInWishlist = true;
        this.displayNotification('Product added to wishlist successfully!');
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        this.displayNotification('Error adding item to wishlist: ' + error.message);
      }
    });
}

removeFromWishlist(product: any): void {
  if (!this.userID) {
    this.displayNotification('Please log in to remove items from wishlist.');
    return;
  }

  this.removeFromWishlistService
    .removeFromWishlist(
      Number(this.userID), 
      Number(this.userID),  // Convert to number for businessId
      product.product_id
    )
    .subscribe({
      next: () => {
        product.isInWishlist = false;
        this.displayNotification('Product removed from wishlist successfully!');
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
        this.displayNotification('Error removing item from wishlist: ' + error.message);
      }
    });
}

private displayNotification(message: string): void {
  // You can implement this using your preferred notification system
  // For now, let's use a simple alert
  alert(message);
}

  viewProductDetails(productId: number): void {
    if (productId) {
      this.router.navigate(['/product-details', productId]);
    } else {
      console.error('Product ID is undefined');
    }
  }

  addToRecentlyViewed(product: any): void {
    // console.log('Adding to recently viewed:', product);
    this.recentlyViewedService.addProductToRecentlyViewed(product);
  }

  closeRecentlyViewed(): void {
    this.showRecentlyViewed = false;
  }

  onBackClick(): void {
    this.navigationService.goBack();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getPagesToShow(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  shouldShowLeftEllipsis(): boolean {
    return this.currentPage > 3;
  }

  shouldShowRightEllipsis(): boolean {
    return this.currentPage < this.totalPages - 2;
  }

  // Fetch products with the current m_id, f_id, s_id, and page number
  fetchProducts(m_id: number, f_id: number, s_id: number, page: number): void {
    // Exit early if m_id is not valid
    if (!m_id) {
      console.log('Invalid m_id: No products to fetch');
      this.products = [];
      this.isLoading = false;
      this.isLocallyLoading = false;
      return;
    }

    const take = this.pageSize;
    const requestData = { m_id, f_id, s_id, page, pageSize: take };

    console.log('Request Data for Category API:', requestData);
    this.isLocallyLoading = true;
    this.isLoading = true;

    this.hierarchyProductsService.getHierarchyProducts(requestData).subscribe(
      (response) => {
        if (response.products && response.products.length > 0) {
          this.products = response.products;
        } else {
          this.products = [];
          console.log('No products found for this category.');
        }

        // Update pagination
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.isLoading = false;
        this.isLocallyLoading = false;
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.products = [];
        this.isLoading = false;
        this.isLocallyLoading = false;
      }
    );
  }

  displayMessage(msg: string): void {
    this.message = msg;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 1000);
  }

  getProductImageUrl(imagePath: string): string {
    const baseUrl = 'https://usaperp.com:5001/Images/Products/';
    return `${baseUrl}${imagePath}`;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchProducts(
      this.m_id ?? 0,
      this.f_id ?? 0,
      this.s_id ?? 0,
      this.currentPage
    );
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.isLocallyLoading = true;
    this.fetchProducts(
      this.m_id ?? 0,
      this.f_id ?? 0,
      this.s_id ?? 0,
      this.currentPage
    );
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.isLocallyLoading = true;
      this.currentPage++;
      this.fetchProducts(
        this.m_id ?? 0,
        this.f_id ?? 0,
        this.s_id ?? 0,
        this.currentPage
      );
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.isLocallyLoading = true;
      this.currentPage--;
      this.fetchProducts(
        this.m_id ?? 0,
        this.f_id ?? 0,
        this.s_id ?? 0,
        this.currentPage
      );
    }
  }

  increaseQuantity(product: any): void {
    if (product.product_quantity < 99) {
      product.product_quantity += 1;
    }
  }

  decreaseQuantity(product: any): void {
    if (product.product_quantity > 1) {
      product.product_quantity -= 1;
    }
  }

  onQuantityInput(event: any, product: any): void {
    const inputQuantity = Number(event.target.value);
    product.product_quantity = inputQuantity > 0 ? inputQuantity : 1;
  }

  addToCart(product: {
    product_id: number;
    product_name: string;
    product_price: number;
    product_quantity: number;
    product_image: string;
    product_identifier2: string;
  }): void {
    const userID = this.userID || '';
    const businessId = this.userID ? +this.userID : 0;
    const upc = product.product_identifier2;

    console.log('Adding product to cart:', product);
    // console.log('User ID:', userID, 'Business ID:', businessId);

    this.addToCartService
      .addToCart(
        product.product_id,
        userID,
        businessId,
        product.product_quantity
      )
      .subscribe({
        next: () => {
          // Update local cart
          this.cartService.addToCart({
            productId: product.product_id.toString(),
            name: product.product_name,
            price: product.product_price,
            image: product.product_image,
            quantity: product.product_quantity,
            upc: upc,
          });

          this.displayMessage('Item added to cart successfully!');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          this.displayMessage('Error adding item to cart: ' + error.message);
        },
      });
  }
}
