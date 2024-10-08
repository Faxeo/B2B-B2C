import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { CartService } from '../../core/services/cart/cart.service';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { AddVehicleService } from '../../core/services/add-vehicle/add-vehicle.service';
import { VehicleSearchService } from '../../core/services/search-vehicle/search-vehicle.service';
import { FilterComponent } from './filter/filter.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, FilterComponent],
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnChanges {
  @Input() searchResults: any[] = [];
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() isLoading: boolean = false; // Initial loading spinner flag
  @Input() isPaginationLoading: boolean = false; // Pagination loading spinner flag
  @Input() searchType:
    | 'generalSearch'
    | 'vehicleSearch'
    | 'categorySearch'
    | null = null;
  @Input() loginType: string | null = null;
  @Output() pageChange = new EventEmitter<number>();
  @Output() vehicleSearchPageChange = new EventEmitter<number>();
  @Output() categorySearchPageChange = new EventEmitter<number>();
  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;
  cartItemCount: number = 0;
  isLocallyLoading: boolean = false;
  notificationMessage: string = ''; // Holds the notification message
  showNotification: boolean = false; // Controls notification visibility

  isCollapsed: boolean = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private loginService: LoginService,
    private addVehicleService: AddVehicleService,
    private vehicleSearchService: VehicleSearchService,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userID = localStorage.getItem('userID');
      // console.log('User ID from localStorage:', this.userID);
      this.loginService.getUserID().subscribe((userID) => {
        this.userID = userID;
        this.cartService.setUserDetails(this.userID, this.loginType);
      });

      this.loginService.getLoginType().subscribe((loginType) => {
        this.loginType = loginType;
        if (this.loginType === 'business') {
          const username = localStorage.getItem('username');
          // console.log('Username:', username);
          this.loginType = username || this.loginType;
        }
        console.log('Login type updated:', this.loginType);
        this.cartService.setUserDetails(this.userID, this.loginType);
      });
    } else {
      console.log('Running in a non-browser environment');
    }
    // Set up the cart item count observable
    this.cartService.cartItemCount$.subscribe((count) => {
      this.cartItemCount = count;
    });
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (isPlatformBrowser(this.platformId)) {

      if (changes['isLoading'] && changes['isLoading'].currentValue === true) {
        this.isLocallyLoading = true;
      } else if (changes['isLoading'] && changes['isLoading'].currentValue === false) {
        this.isLocallyLoading = false;
      }

      // Handle pagination loading separately
      if (changes['isPaginationLoading'] && changes['isPaginationLoading'].currentValue === true) {
        this.isLocallyLoading = true; // Show loading spinner during pagination
      } else if (changes['isPaginationLoading'] && changes['isPaginationLoading'].currentValue === false) {
        this.isLocallyLoading = false; // Hide loading spinner after pagination
      }

      // Hide the spinner when new search results arrive
      if (changes['searchResults'] && changes['searchResults'].currentValue) {
        this.isLocallyLoading = false; // Hide spinner when new results are displayed
        console.log('New search results:', changes['searchResults'].currentValue); // Debug log
      }

      // Manually trigger change detection when `isLocallyLoading` state changes
      this.cdr.detectChanges();
      // Check if new search results are available
      if (changes['searchResults'] && changes['searchResults'].currentValue) {
        console.log('New search results:', changes['searchResults'].currentValue);
  
        // Map the 'price' field to 'product_price' for each product
        changes['searchResults'].currentValue.forEach((product: any) => {
          console.log('Product Data Check Before Mapping:', product);
          this.searchResults.forEach((product) => {
            if (product.product_quantity === undefined || product.product_quantity === null) {
              product.product_quantity = 1;
            }
          });
  
          // Assign 'product_price' based on 'price' from API response
          product.product_price = product.price || 0; // Map 'price' to 'product_price'
          
          // Log after mapping
          console.log('Product Data Check After Mapping:', product);
        });
      }
    }
    
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
    if (!this.userID) {
      alert('Please log in to add items to your cart.');
      return;
    }
  
    const upc = product.product_identifier2;
  
    console.log('Adding product to cart:', product);
  
    // Pass `this.userID` as `businessId` and product quantity in the function call
    this.addToCartService
      .addToCart(
        product.product_id,          // productId
        this.userID,                 // userID (used as customerID)
        +this.userID,                // businessId (using userID as businessId)
        product.product_quantity     // product quantity
      )
      .subscribe({
        next: () => {
          this.addToCartService.updateCart(
            product.product_id.toString(),
            product.product_name,
            product.product_price,
            product.product_image,
            product.product_quantity,
            upc
          );
          this.displayMessage('Item added to cart successfully!');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          this.displayMessage('Error adding item to cart: ' + error.message);
        },
      });
  }
  
  

  displayMessage(msg: string): void {
    this.message = msg;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 1000);
  }

  displayNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;

    // Hide the notification after 3 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  addVehicle(product: any): void {
    const vehicleData = this.vehicleSearchService.getVehicleData(); 

    if (!vehicleData.year || !vehicleData.make || !vehicleData.model || !vehicleData.trim || !vehicleData.engine) {
      this.displayNotification('Please ensure all vehicle details are selected before adding the vehicle.');
      return;
    }

    this.vehicleSearchService.setVehicleData({
      ...vehicleData,
      customerID: this.userID ? parseInt(this.userID, 10) : 0,
    });

    this.addVehicleService.addCustomerVehicle().subscribe({
      next: (response) => {
        console.log('Vehicle added successfully:', response);
        this.displayNotification('Vehicle has been added to your garage successfully.');
      },
      error: (error) => {
        console.error('Error adding vehicle:', error);
        this.displayNotification('Failed to add the vehicle. Please try again later.');
      },
    });
  }
  
  // Method to handle vehicle search pagination
  searchByVehicle(page: number): void {
    console.log('Vehicle Search Pagination to page:', page);
    this.isLocallyLoading = true; // Show loading spinner during vehicle search pagination
    this.vehicleSearchPageChange.emit(page);
    this.cdr.detectChanges(); // Trigger change detection for view update
  }

  // Method to handle category search pagination
  searchByCategory(page: number): void {
    console.log('Category Search Pagination to page:', page);
    this.isLocallyLoading = true; // Show loading spinner during category search pagination
    this.categorySearchPageChange.emit(page);
    this.cdr.detectChanges(); // Trigger change detection for view update
  }

  emitPageChange(page: number): void {
    if (this.searchType === 'generalSearch') {
      this.pageChange.emit(page); // Emit general search page change
    } else if (this.searchType === 'vehicleSearch') {
      this.searchByVehicle(page); // Emit vehicle search page change
    } else if (this.searchType === 'categorySearch') {
      this.searchByCategory(page); // Emit category search page change
    }
  }
}
