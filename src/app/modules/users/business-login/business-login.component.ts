import { Component } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-business-login',
  templateUrl: './business-login.component.html',
  styleUrl: './business-login.component.css'
})
export class BusinessLoginComponent {

  constructor(private apiService: ApiService, private router: Router) {}

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  onSubmit(): void {
    const loginData = {
      email: this.email,
      password: this.password
    };
  
    this.apiService.post<any>('/Profile/businessLogin', loginData).subscribe(
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
