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
    if (!token) {
      console.error('Attempted to login with null token');
      return;
    }

    try {
      // Decode token to get expiration
      const decodedToken = this.jwtHelper.decodeToken(token);
      const expirationDate = new Date(decodedToken.exp * 1000);

      // Store token in both cookie and localStorage
      this.cookieService.set('token', token, {
        path: '/',
        secure: true,
        sameSite: 'Strict',
        expires: expirationDate
      });
      
      // Also store as authToken for LoginService compatibility
      this.cookieService.set('authToken', token, {
        path: '/',
        secure: true,
        sameSite: 'Strict',
        expires: expirationDate
      });
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);  // For LoginService compatibility
      }
      
      console.log('Token stored successfully, expires:', expirationDate);
      this.isAuthenticated.next(true);
    } catch (error) {
      console.error('Failed to process login token:', error);
      this.clearSession();
    }
  }

  logout() {
    this.clearSession();
  }

  private clearSession(navigate: boolean = true) {
    // Clear all auth-related cookies
    this.cookieService.delete('token', '/');
    this.cookieService.delete('authToken', '/');
    this.cookieService.delete('userID', '/');
    this.cookieService.delete('businessID', '/');
    this.cookieService.delete('loginType', '/');
    this.cookieService.delete('username', '/');
    
    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userID');
      localStorage.removeItem('businessID');
      localStorage.removeItem('loginType');
      localStorage.removeItem('username');
    }
    
    this.isAuthenticated.next(false);

    if (navigate) {
      window.location.reload();
    }
  }
}