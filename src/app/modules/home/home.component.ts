import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    SidebarComponent,
    FooterComponent
  ],
  providers: [ApiService, SidebarToggleService], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  categories$: Observable<any[]> | undefined;
  products$: Observable<any[]> | undefined;
  loginType: string | null = null;
  isAdminSidebarVisible: boolean = false;

  constructor(
    private apiService: ApiService,
    private sidebarToggleService: SidebarToggleService,
    private loginService: LoginService,
    private logoutService: LogoutService 
  ) {}

  ngOnInit(): void {
    this.categories$ = this.apiService.getMainCategory().pipe(
      map(categories => categories.map((category: { name: string; }) => ({
        ...category,
        image: `assets/car-parts-&-accessories.png`
      }))) 
    );
  
    this.products$ = this.apiService.getProducts().pipe(
      map(products => products.map((product: { product_image: string; }) => ({
        ...product,
        image: `${product.product_image}`
      })))
    );
  
    // Subscribe to login type changes
    this.loginService.getLoginType().subscribe(loginType => {
      this.loginType = loginType;
      console.log('Login type updated:', this.loginType);
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
}
