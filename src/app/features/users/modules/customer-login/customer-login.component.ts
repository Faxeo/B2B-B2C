import { Component } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-customer-login',
    templateUrl: './customer-login.component.html',
    styleUrl: './customer-login.component.css',
    standalone: false
})
export class CustomerLoginComponent {

  constructor(private apiService: ApiService, private router: Router) {}

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  onSubmit(): void {
    const loginData = {
      email: this.email,
      password: this.password
    };
  
    this.apiService.post<any>('Profile/customerLogin', loginData).subscribe(
      response => {
        console.log('Login successful', response);
        // this.router.navigate(['/admin-dashboard']); 
      },
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}
