import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
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
import { CategoryNavbarSearchService } from '../../core/services/category-navbar-search/category-navbar-search.service';
import { DynamicSearchService } from '../../core/services/dynamic-search/dynamic-search.service';
import { take } from 'rxjs/operators';
import { CartSidebarService } from '../../core/services/cart-sidebar/cart-sidebar.service';

@Component({
  selector: 'app-category-results',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RecentlyViewedComponent,
    RouterModule,
  ],
  templateUrl: './category-results.component.html',
  styleUrl: './category-results.component.css'
})
export class CategoryResultsComponent implements OnInit {
  @Input() searchResults: any[] = [];
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
  selectedBrandId: number | null = null;

  wishlist: number[] = []; // Array to store product IDs in the wishlist
  businessId: number = 123; // Replace with your actual business ID

  activeSearchType: 'general' | 'category' | 'vehicle' = 'general'; // Default to 'general'
  lastQuery: string = '';
  currentRequestData: any = {};
  selectedMake: string | null = null;

  @Input() searchType:
    | 'generalSearch'
    | 'vehicleSearch'
    | 'categorySearch'
    | 'filterCategorySearch'
    | null = null;

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
    private wishlistService: WishlistService,
    private categoryNavbarSearchService: CategoryNavbarSearchService,
    private dynamicSearchService: DynamicSearchService,
    private cdr: ChangeDetectorRef,
        private cartSidebarService: CartSidebarService,
  ) {
    this.filterSearchService.selectedCategories$.subscribe((categories) => {
      this.m_id = categories.m_id;
      this.f_id = categories.f_id;
      this.s_id = categories.s_id;
      // Fetch products based on updated filter values, starting from page 1
      // this.fetchProducts(this.m_id ?? 0, this.f_id ?? 0, this.s_id ?? 0, 1);
    });
  }

  ngOnInit(): void {
    // Retrieve the 'categoryId' from the service
    this.recentlyViewedService.recentlyViewed$.subscribe((products) => {
      this.showRecentlyViewed = products.length > 0;
    });
  
    const categoryId = this.categoryIdService.getCategoryId();
    console.log('CategoryComponent received categoryId:', categoryId);
  
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
  
    if (categoryId !== null) {
      this.m_id = categoryId;
      console.log('Performing general search for category:', this.m_id);
      this.performGeneralSearch('', this.m_id); // Perform general search with `m_id`
    } else {
      console.error('No valid category ID found');
      this.isLoading = false;
    }
  
    this.loadWishlist();
  
    const { m_id, f_id, s_id } =
    this.categoryNavbarSearchService.getCategoryData();
  console.log('Saved Category Data:', { m_id, f_id, s_id });

  this.filterSearchService.selectedCategories$.subscribe(() => {
    this.updateFilters();
  });

  this.filterSearchService.selectedBrand$.subscribe(() => {
    this.updateFilters();
  });

  this.filterSearchService.selectedMake$.subscribe((make) => {
    console.log('CategoryResultsComponent: Received new make from service:', make);
    this.selectedMake = make;
    console.log('CategoryResultsComponent: Updated local selectedMake:', this.selectedMake);
    this.updateFilters(); // Trigger backend request
  });
  
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (isPlatformBrowser(this.platformId)) {
        if (changes['isLoading'] || changes['isPaginationLoading']) {
          const isLoadingNow =
            changes['isLoading']?.currentValue === true ||
            changes['isPaginationLoading']?.currentValue === true;
  
          this.isLocallyLoading = isLoadingNow;
          this.cdr.detectChanges();
        }
  
        if (changes['searchResults'] && changes['searchResults'].currentValue) {
          this.isLocallyLoading = false;
          this.cdr.detectChanges();
        }
      }
    }
  
    private updateFilters(m_id?: number, f_id?: number, s_id?: number): void {
      const categoryData = this.categoryNavbarSearchService.getCategoryData();
    
      this.m_id = m_id ?? categoryData?.m_id ?? this.m_id ?? null;
      this.f_id = f_id ?? categoryData?.f_id ?? this.f_id ?? null;
      this.s_id = s_id ?? categoryData?.s_id ?? this.s_id ?? null;
    
      console.log('CategoryResultsComponent: Updated filters:', {
        m_id: this.m_id,
        f_id: this.f_id,
        s_id: this.s_id,
        make: this.selectedMake,
      });
    
      this.performGeneralSearch(
        '',
        this.m_id ?? undefined,
        this.f_id ?? undefined,
        this.s_id ?? undefined
      );
    }
    
    
  performGeneralSearch(query: string, m_id?: number, f_id?: number, s_id?: number): void {
    this.activeSearchType = 'general';
    this.lastQuery = query;
  
    console.log('Performing general search with query:', query || 'Empty Query');
  
    m_id = m_id ?? this.m_id ?? undefined;
    f_id = f_id ?? this.f_id ?? undefined;
    s_id = s_id ?? this.s_id ?? undefined;
  
    if (!m_id) {
      console.warn('Invalid m_id: No products to fetch');
      this.searchResults = [];
      this.isLocallyLoading = false;
      return;
    }
  
    this.filterSearchService.selectedBrand$
      .pipe(take(1))
      .subscribe((selectedBrandId) => {
        console.log('Resolved filters:', { m_id, f_id, s_id, selectedBrandId });
  
        this.currentRequestData = {
          productName: '',
          manufacturer: '',
          compatibility: '',
          brand: selectedBrandId ? `${selectedBrandId}` : '',
          search_description: query,
          upc: '',
          partNumber: '',
          attribute: '',
          includeCompatibility: false,
          includeManufacturer: false,
          includeAttribute: false,
          includeQuantity: false,
          includeImages: false,
          skip: (this.currentPage - 1) * this.pageSize,
          take: this.pageSize,
          m_id: m_id,
          f_id: f_id,
          s_id: s_id,
          keyFeature: '',
          vendor: null,
          compatiblityValues: {
            compatibilityID: 0,
            productID: 0,
            sno: null,
            year: '',
            make: this.selectedMake || '',
            model: '',
            trim: '',
            engine: '',
            notes: '',
            isDeleted: null,
          },
          product_Attributes:
            "SELECT product_id FROM product_attributes_view WHERE concatenated_attributes LIKE '%%' order by product_id",
          attributeSearch: false,
          page: this.currentPage,
        };
  
        console.log('Request Data Sent to Backend:', this.currentRequestData);
  
        this.isLocallyLoading = true;
  
        this.dynamicSearchService.searchProducts(this.currentRequestData).subscribe(
          (response: any) => {
            console.log('Response from Backend:', response);
  
            if (response?.products) {
              this.searchResults = response.products;
              this.totalPages = response.totalPages || 1;
            } else {
              console.error('Unexpected response format:', response);
              this.displayMessage('Unexpected response format from the server.');
            }
  
            this.isLocallyLoading = false;
            this.cdr.detectChanges();
          },
          (error: any) => {
            console.error('Error performing general search:', error);
            this.isLocallyLoading = false;
            this.displayMessage('An error occurred while fetching search results.');
          }
        );
      });
  }

  // Fetch wishlist details
  loadWishlist(): void {
    if (!this.userID) return;

    this.wishlistService
      .getWishlistDetailsByBusinessId(this.businessId)
      .subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            const wishlistIds = response.map((item: any) => item.productId);
            this.markWishlistProducts(wishlistIds);
          }
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
        },
      });
  }

  markWishlistProducts(wishlistIds: number[]): void {
    this.products = this.products.map((product) => ({
      ...product,
      isInWishlist: wishlistIds.includes(product.product_id),
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

  emitPageChange(page: number): void {
    // console.log(
    //   `emitPageChange called with page: ${page} and searchType: ${this.searchType}`
    // );
    this.currentPage = page;
    this.isLocallyLoading = true;

    // Update skip and page for pagination
    this.currentRequestData.skip = (this.currentPage - 1) * 10;
    this.currentRequestData.page = this.currentPage;

    this.dynamicSearchService.searchProducts(this.currentRequestData).subscribe(
      (response: any) => {
        this.searchResults = response.products || [];
        this.totalPages = response.totalPages || 1;
        this.isLocallyLoading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        // console.error(
        //   `Error fetching products for ${this.searchType} pagination:`,
        //   error
        // );
        this.isLocallyLoading = false;
      }
    );
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
        Number(this.userID) // Convert to number for businessId
      )
      .subscribe({
        next: () => {
          product.isInWishlist = true;
          this.displayNotification('Product added to wishlist successfully!');
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.displayNotification(
            'Error adding item to wishlist: ' + error.message
          );
        },
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
        Number(this.userID), // Convert to number for businessId
        product.product_id
      )
      .subscribe({
        next: () => {
          product.isInWishlist = false;
          this.displayNotification(
            'Product removed from wishlist successfully!'
          );
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          this.displayNotification(
            'Error removing item from wishlist: ' + error.message
          );
        },
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
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.isLocallyLoading = true;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.isLocallyLoading = true;
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.isLocallyLoading = true;
      this.currentPage--;
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

          this.cartSidebarService.openCartSidebar();
          this.displayMessage('Item added to cart successfully!');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          this.displayMessage('Error adding item to cart: ' + error.message);
        },
      });
  }
}
