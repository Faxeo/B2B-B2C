// logout.service.ts
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
  ) {}

  logout() {
    const userID = localStorage.getItem('userID') || localStorage.getItem('businessID') || localStorage.getItem('merchantID');
    
    this.loginService.getCategory().pipe(take(1)).subscribe(category => {
      const logoutData = {
        customerID: userID ? +userID : 0,
        category: category || ''
      };

      this.apiService.post<any>('Profile/customerLogout', logoutData).subscribe({
        next: () => {
          localStorage.clear();
          this.loginService.clearData();
          this.router.navigate(['/']); // Redirect to login page after logout
        },
        error: (error) => {
          console.error('Logout failed', error);
        }
      });
    });
  }
}
