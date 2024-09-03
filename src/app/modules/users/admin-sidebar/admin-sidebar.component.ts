import { Component } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
})


export class AdminSidebarComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private apiService: ApiService, private router: Router) {}
   
  onSubmit(): void {
    const loginData = {
      email: this.email,
      password: this.password,
    };

    this.apiService.post<any>('Profile/customerLogin', loginData).subscribe({
      next: (response) => {
        console.log('Full login response:', response);

        if (response.token) {
          localStorage.setItem('token', response.token);
          // console.log('Token stored:', localStorage.getItem('token'));
          // Message('Welcome to Sanwa Systems');

          if (
            response.response &&
            response.response.data &&
            response.response.data.customer_id
          ) {
            localStorage.setItem('userID', response.response.data.customer_id);
            // console.log('Customer ID stored:', localStorage.getItem('userID'));
          } else {
            console.error(
              'customer_id is not defined in the expected location in the response data'
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
        this.router.navigate(['/sidebar/admin-dashboard']);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
