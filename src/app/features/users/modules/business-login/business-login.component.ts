import { Component } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/services/login-service/login-service.service';

@Component({
  selector: 'app-business-login',
  templateUrl: './business-login.component.html',
  styleUrl: './business-login.component.css'
})
export class BusinessLoginComponent {

  constructor(private apiService: ApiService, private router: Router, private loginService: LoginService) {}

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  onSubmit(): void {
    const loginData = {
      email: this.email,
      password: this.password
    };
  
    this.apiService.post<any>('/Profile/businessLogin', loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        const data = response.response?.data;
        const token = response.token;

        if (data && data.customer_id && data.customer_type) {
          const userId = data.customer_id.toString();
          const userName = data.customer_name || 'Guest';
          const loginType = data.customer_type;

          // Save login data
          this.loginService.setUserID(userId);
          this.loginService.setUserName(userName);
          this.loginService.setLoginType(loginType);
          localStorage.setItem('authToken', token);

          console.log('Saved username:', userName);

          // Navigate to homepage
          this.router.navigate(['/home']);
        }},error: (err) => {
        console.error('Login failed:', err);
        // Optionally show UI message to user
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}