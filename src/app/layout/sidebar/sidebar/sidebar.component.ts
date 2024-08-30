import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarToggleService } from '../../../core/services/sidebar-toggle/sidebar-toggle.service';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/services/login-service/login-service.service';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SignUpService } from '../../../core/services/signup-service/signup-service.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [RouterModule, CommonModule, FormsModule],
})
export class SidebarComponent implements OnInit {
  isExpanded = false;
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  selectedLoginType: string = '';

  constructor(
    private sidebarToggleService: SidebarToggleService,
    private loginService: LoginService,
    private router: Router,
    private apiService: ApiService,
    private signUpService: SignUpService
  ) {}

  ngOnInit() {
    this.sidebarToggleService.getSidebarState().subscribe((state) => {
      this.isExpanded = state;
    });

    this.loginService.getLoginType().subscribe((type) => {
      this.selectedLoginType = type || '';
    });
  }

  closeSidebar() {
    this.sidebarToggleService.toggleSidebar();
  }

  onLogin() {
    if (this.selectedLoginType && this.email && this.password) {
      let apiUrl = '';
      let redirectUrl = '';
  
      // Determine the API endpoint and redirect URL based on the selected login type
      switch (this.selectedLoginType) {
        case 'admin':
          apiUrl = 'Profile/customerLogin';
          redirectUrl = '/';
          break;
        case 'business':
          apiUrl = 'Profile/businessLogin';
          redirectUrl = '/business-dashboard';
          break;
        case 'merchant':
          apiUrl = 'Profile/merchantLogin';
          redirectUrl = '/sidebar/merchant-dashboard';
          break;
        default:
          console.error('Unknown login type');
          return;
      }
  
      const loginData = {
        email: this.email,
        password: this.password,
      };
  
      this.apiService.post<any>(apiUrl, loginData).subscribe({
        next: (response) => {
          console.log('Full login response:', response);
  
          if (response.token) {
            localStorage.setItem('token', response.token);
  
            // Set the loginType after successful login
            this.loginService.setLoginType(this.selectedLoginType);
  
            if (
              response.response &&
              response.response.data &&
              response.response.data.customer_id
            ) {
              localStorage.setItem('userID', response.response.data.customer_id);
            } else if (
              response.response &&
              response.response.data &&
              response.response.data.business_id
            ) {
              localStorage.setItem('businessID', response.response.data.business_id);
            } else if (
              response.response &&
              response.response.data &&
              response.response.data.merchant_id
            ) {
              localStorage.setItem('merchantID', response.response.data.merchant_id);
            } else {
              console.error(
                'ID is not defined in the expected location in the response data'
              );
            }
          } else {
            console.error('Token is not present in the response');
          }
        },
        error: (error) => {
          console.error('Login failed', error);
        },
        complete: () => {
          this.router.navigate([redirectUrl]);
          this.closeSidebar();
        },
      });
    }
  }
  

  setLoginType(type: string) {
    this.loginService.setLoginType(type);
    this.selectedLoginType = type;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSignUpClick() {
    this.signUpService.openSignUpPage();
  }
}
