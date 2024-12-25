import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  jwtHelper = new JwtHelperService();
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private cookieService: CookieService) {
    this.checkTokenOnInit();
  }

  checkTokenOnInit() {
    // First check cookies
    let token: string | null = this.cookieService.get('token') || null;
    
    // If not in cookies, check localStorage as fallback
    if (!token && typeof window !== 'undefined' && window.localStorage) {
      const localStorageToken = localStorage.getItem('token');
      if (localStorageToken) {
        token = localStorageToken;
        // If found in localStorage, migrate it to cookies
        this.cookieService.set('token', localStorageToken, {
          path: '/',
          secure: true,
          sameSite: 'Strict'
        });
        localStorage.removeItem('token'); // Clean up localStorage
      }
    }

    if (token) {
      if (!this.jwtHelper.isTokenExpired(token)) {
        const decodedToken = this.jwtHelper.decodeToken(token);
        console.log('Decoded Token:', decodedToken);
        this.isAuthenticated.next(true);
      } else {
        console.warn('Token Expired');
        this.clearSession();
      }
    } else {
      console.warn('No Token Found');
      this.clearSession(false);
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  login(token: string) {
    // Store token in both cookie and localStorage for redundancy
    this.cookieService.set('token', token, {
      path: '/',
      secure: true,
      sameSite: 'Strict',
      expires: 7 // 7 days expiration
    });
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
    
    this.isAuthenticated.next(true);
  }

  logout() {
    this.clearSession();
  }

  private clearSession(navigate: boolean = true) {
    this.cookieService.delete('token', '/');
    this.cookieService.delete('userID', '/');
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      localStorage.removeItem('loginType');
    }
    
    this.isAuthenticated.next(false);

    if (navigate) {
      window.location.reload();
    }
  }
}