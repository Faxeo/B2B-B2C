import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarToggleService } from '../../../shared/sidebar-toggle/sidebar-toggle.service';
import { Router } from '@angular/router';
import { LoginService } from '../../../features/users/services/login-service/login-service.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../shared/api.service';
import { SignUpService } from '../../../features/users/services/signup-service/signup-service.service';
import { AuthService } from '../../../shared/Session/auth.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    imports: [RouterModule, CommonModule, FormsModule]
})

export class SidebarComponent implements OnInit {
  isExpanded = false;
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  selectedLoginType: string = '';
  errorMessage: string = '';
  @Input() isVisible: boolean = false;


  constructor(
    private sidebarToggleService: SidebarToggleService,
    private loginService: LoginService,
    private router: Router,
    private apiService: ApiService,
    private signUpService: SignUpService,
    private authService: AuthService,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.sidebarToggleService.getSidebarState().subscribe((state) => {
      this.isExpanded = state;
    });

    this.loginService.getLoginType().subscribe((type) => {
      this.selectedLoginType = type || '';
    });

    this.sidebarToggleService.getSidebarState().subscribe((state) => {
      this.isExpanded = state;
    });

    this.sidebarToggleService.getSidebarState().subscribe((state) => {
      this.isExpanded = state;
    });
  
    if (typeof window !== 'undefined' && localStorage) {
      this.authService.checkTokenOnInit() ;
    }
  
    this.loginService.getLoginType().subscribe((type) => {
      this.selectedLoginType = type || '';
    });
  }

  closeSidebar() { 
    this.sidebarToggleService.toggleSidebar();
  }

  onLogin() {
    this.errorMessage = '';
  
    if (this.selectedLoginType && this.email && this.password) {
      let apiUrl = '';
      let redirectUrl = '/B2B';
  
      switch (this.selectedLoginType) {
        case 'admin':
        case 'customer':
          apiUrl = `Profile/customerLogin`;
          break;
        case 'merchant':
        case 'business':
          apiUrl = `Profile/${this.selectedLoginType}Login`;
          break;
        default:
          this.errorMessage = 'Wrong Login Type';
          return;
      }
  
      const loginData = {
        email: this.email,
        password: this.password,
      };
  
      this.apiService.post<any>(apiUrl, loginData).subscribe({
        next: (response) => {
          if (response.token) {
            const usernameresponse = response.response?.data?.customer_name || 'Guest';
            // Use AuthService to set token instead of localStorage
            this.authService.login(response.token, usernameresponse);  // Use login to set token
            this.loginService.setLoginType(this.selectedLoginType);
  
            if (response.response?.data?.customer_id) {
              const userID = response.response.data.customer_id;
              this.cookieService.set('userID', userID);
              this.loginService.setUserID(userID);
            } else {
              this.errorMessage = 'User ID not found in the response data.';
            }
          } else {
            this.errorMessage = 'Wrong password or email.';
          }
        },
        error: (error) => {
          this.errorMessage = 'Login failed. Please check your credentials.';
          console.error('Login failed', error);
        },
        complete: () => {
          if (!this.errorMessage) {
            this.router.navigate([redirectUrl]).then(() => {
              this.closeSidebar();
            });
          }
        },
      });
    } else {
      this.errorMessage = 'Please fill in all the fields.';
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
