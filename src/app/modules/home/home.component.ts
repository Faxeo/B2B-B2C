import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar/sidebar.component';
import { SidebarToggleService } from '../../core/services/sidebar-toggle/sidebar-toggle.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { LogoutService } from '../../core/services/logout-service/logout-service.service';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { CartService } from '../../core/services/cart/cart.service';  // Import CartService
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    SidebarComponent,
    FooterComponent,
    FormsModule,
  ],
  providers: [ApiService, SidebarToggleService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  categories$: Observable<any[]> | undefined;
  products$: Observable<any[]> | undefined;
  loginType: string | null = null;
  isAdminSidebarVisible: boolean = false;
  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;

  cartItemCount: number = 0;  // Add variable for cart item count

  constructor(
    private apiService: ApiService,
    private sidebarToggleService: SidebarToggleService,
    private loginService: LoginService,
    private addToCartService: AddToCartService,
    private cartService: CartService,  // Inject CartService
    private logoutService: LogoutService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userID = localStorage.getItem('userID');
      console.log('User ID from localStorage:', this.userID);
      this.loginService.getUserID().subscribe((userID) => {
        this.userID = userID;
        this.cartService.setUserDetails(this.userID, this.loginType);  // Set user details in CartService
      });
  
      this.loginService.getLoginType().subscribe((loginType) => {
        this.loginType = loginType;
        if (this.loginType === 'business') {
          const username = localStorage.getItem('username');
          console.log('Username:', username);
          this.loginType = username || this.loginType;
        }
        console.log('Login type updated:', this.loginType);
        this.cartService.setUserDetails(this.userID, this.loginType);  // Set user details in CartService
      });
    } else {
      console.log('Running in a non-browser environment');
    }

    // Initialize categories and products
    this.categories$ = this.apiService.getMainCategory().pipe(
      map((categories) =>
        categories.map((category: { name: string }) => ({
          ...category,
          image: `assets/car-parts-&-accessories.png`,
        }))
      )
    );

    // Ensure each product has a default quantity of 1 when fetched
    this.products$ = this.apiService.getProducts().pipe(
      map(products => products.map((product: { product_image: string; }) => ({
        ...product,
        image: `${product.product_image}`,
        product_quantity: 1  // Initialize quantity to 1
      })))
    );

    // Subscribe to cart item count observable
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  openSidebar() {
    this.sidebarToggleService.toggleSidebar();
  }

  toggleAdminSidebar() {
    this.isAdminSidebarVisible = !this.isAdminSidebarVisible;
  }

  logout() {
    this.logoutService.logout();
  }

  increaseQuantity(product: any): void {
    if (product.product_quantity < 99) {  // max limit
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
    if (inputQuantity > 0) {
      product.product_quantity = inputQuantity; 
    } else {
      product.product_quantity = 1; 
    }
  }

  addToCart(product: { 
  product_id: number, 
  product_name: string, 
  product_price: number, 
  product_quantity: number, 
  product_image: string, 
  product_identifier2: string  
}): void {
  if (!this.userID) {
    alert('Please log in to add items to your cart.');
    return;
  }

  const upc = product.product_identifier2; 

  console.log('Adding product to cart:', product);

  this.addToCartService.addToCart(product.product_id.toString(), this.userID).subscribe({ 
    next: () => {
      
      this.addToCartService.updateCart(
        product.product_id.toString(), 
        product.product_name, 
        product.product_price,
        product.product_image,
        product.product_quantity,  // Pass the correct quantity here
        upc  // Pass the UPC here
      );
      this.displayMessage('Item added to cart successfully!');
    },
    error: (error) => {
      console.error('Error adding to cart:', error);
      this.displayMessage('Error adding item to cart: ' + error.message);
    }
  });
}

  displayMessage(msg: string): void {
    this.message = msg;
    this.showMessage = true;
    
    setTimeout(() => {
      this.showMessage = false;
    }, 1000); 
  }
}
