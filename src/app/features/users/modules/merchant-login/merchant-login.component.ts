import { Component } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-merchant-login',
    templateUrl: './merchant-login.component.html',
    styleUrl: './merchant-login.component.css',
    standalone: false
})
export class MerchantLoginComponent {
  constructor(private apiService: ApiService, private router: Router) {}

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  onSubmit(): void {
    const loginData = {
      email: this.email,
      password: this.password
    };
  
    this.apiService.post<any>('/Profile/merchantLogin', loginData).subscribe(
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
