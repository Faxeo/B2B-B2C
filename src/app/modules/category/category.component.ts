import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
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

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, FilterComponent],
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit {
  m_id: number | null = null; // The category id (m_id) passed from the home component
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private hierarchyProductsService: HierarchyProductsService,
    private categoryIdService: CategoryIdService,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private loginService: LoginService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    // Retrieve the 'categoryId' from the service
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
      this.fetchProducts(this.m_id, this.currentPage); // Fetch products based on the 'categoryId'
    } else {
      // console.error('No valid category ID found');
      this.isLoading = false;
    }
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

  fetchProducts(m_id: number, page: number): void {
    const take = this.pageSize; // Number of products per page
    const skip = (page - 1) * take; // Calculate how many products to skip

    // Update the request data to include f_id and s_id
    const requestData = {
      m_id: m_id,
      f_id: 0, // You can replace 0 with actual f_id value if available
      s_id: 0, // You can replace 0 with actual s_id value if available
      page: page, // Add the page number here
      pageSize: take, // The number of products to take
    };

    // Log the request data to the console for debugging
    // console.log('Request Data for Category API:', requestData);

    this.isLoading = true;

    this.hierarchyProductsService.getHierarchyProducts(requestData).subscribe(
      (response) => {
        // Log the response data to the console
        // console.log('Response Data from Category API:', response);

        this.products = response.products;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.isLoading = false;
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
    const baseUrl =
      'https://usautoparts-beta.azurewebsites.net/Images/Products/';
    return `${baseUrl}${imagePath}`;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    if (this.m_id) {
      this.fetchProducts(this.m_id, this.currentPage); // Fetch products for the new page
    }
  }

  // Pagination: Move to next page

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    if (this.m_id !== null) {
      this.currentPage = page;
      this.fetchProducts(this.m_id, this.currentPage); // Fetch products for the new page
    } else {
      console.error('m_id is null when attempting to change page');
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.m_id !== null) {
        this.fetchProducts(this.m_id, this.currentPage); // Ensure m_id is passed
      } else {
        console.error('m_id is null in nextPage');
      }
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.m_id !== null) {
        this.fetchProducts(this.m_id, this.currentPage); // Ensure m_id is passed
      } else {
        console.error('m_id is null in prevPage');
      }
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
