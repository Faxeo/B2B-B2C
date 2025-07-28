import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerLoginService } from '../../../../core/services/customer-login/customer-login.service';
import { LoginService } from '../../../../core/services/login-service/login-service.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-b2c-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './b2c-login.component.html',
  styleUrl: './b2c-login.component.css'
})
export class B2cLoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private customerLoginService: CustomerLoginService,
    private loginService: LoginService,
    private cookieService: CookieService,
    private router: Router,
  ) {}

  onLogin() {
    this.errorMessage = '';
    if (this.email && this.password) {
      this.customerLoginService.customerLogin(this.email, this.password).subscribe({
        next: (response) => {
          if (response.token) {
            // Set the token and customer name in cookies
            this.customerLoginService.login(response);

            // Save userID in LoginService
            if (response.response?.data?.customer_id) {
              const userID = response.response.data.customer_id;
              this.loginService.setUserID(userID);  // Track userID
              this.cookieService.set('userID', userID);
            }

            // Set login type as 'B2C'
            this.loginService.setLoginType('customer');
            this.router.navigate(['/B2C']);
          } else {
            this.errorMessage = 'Invalid email or password.';
          }
        },
        error: () => {
          this.errorMessage = 'Login failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please enter your email and password.';
    }
  }

  closeLogin() {
    this.router.navigate(['/B2C']);
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; 
  }

  onSignUpClick() {
    this.router.navigate(['/signup']);
  }
}