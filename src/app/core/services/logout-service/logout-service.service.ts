import { Injectable } from '@angular/core';
import { LoginService } from '../login-service/login-service.service';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  constructor(
    private loginService: LoginService,
    private apiService: ApiService,
    private router: Router
  ) { }

  logout() {
    const userID = localStorage.getItem('userID') || localStorage.getItem('businessID') || localStorage.getItem('merchantID');
    const loginType = localStorage.getItem('loginType') || '';  // Fetch loginType from local storage

    this.loginService.getCategory().pipe(take(1)).subscribe(category => {
      const logoutData = {
        customerID: userID ? +userID : 0,
        category: category || ''
      };

      this.apiService.post<any>('Profile/customerLogout', logoutData).subscribe({
        next: () => {
          localStorage.clear();
          this.loginService.clearData();

          // Conditional redirection based on loginType
          if (loginType === 'customer') {
            this.router.navigate(['/B2C']);  // Redirect to B2C for customers
          } 
          else if (loginType === 'business') {
            this.router.navigate(['/B2B']);  // Redirect to B2B for other users
          } 
          else {
            this.router.navigate(['/B2C']);
          }
        },
        error: (error) => {
          console.error('Logout failed', error);
        }
      });
    });
  }
}
