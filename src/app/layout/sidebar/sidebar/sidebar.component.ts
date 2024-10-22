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
  errorMessage: string = '';

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
    // Clear any previous error messages before attempting to log in again
    this.errorMessage = '';
  
    if (this.selectedLoginType && this.email && this.password) {
      let apiUrl = '';
      let redirectUrl = '/'; // Default redirect URL after login
  
      switch (this.selectedLoginType) {
        case 'admin':
        case 'customer':
        case 'merchant':
        case 'business':
          apiUrl = `Profile/${this.selectedLoginType}Login`;
          break;
        default:
          this.errorMessage = 'Wrong Login Type'; // Set error for wrong login type
          return;
      }
  
      const loginData = {
        email: this.email,
        password: this.password,
      };
  
      this.apiService.post<any>(apiUrl, loginData).subscribe({
        next: (response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.loginService.setLoginType(this.selectedLoginType);
  
            if (response.response && response.response.data) {
              const userID = response.response.data.customer_id;
  
              if (userID) {
                localStorage.setItem('userID', userID);
                this.loginService.setUserID(userID);
              } else {
                this.errorMessage = 'User ID not found in the response data.';
              }
            }
          } else {
            this.errorMessage = 'Wrong password or email.'; // Set error for wrong email or password
          }
        },
        error: (error) => {
          this.errorMessage = 'Login failed. Please check your credentials.'; // Set error on API failure
          console.error('Login failed', error);
        },
        complete: () => {
          if (!this.errorMessage) {  // Only proceed if there are no errors
            this.router.navigate([redirectUrl]).then(() => {
              // Close sidebar after successful navigation
              this.closeSidebar();
            });
          }
        },
      });
    } else {
      this.errorMessage = 'Please fill in all the fields.'; // Handle empty fields
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
