// import { Injectable } from '@angular/core';
// import { JwtHelperService } from '@auth0/angular-jwt';
// import { CookieService } from 'ngx-cookie-service';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   jwtHelper = new JwtHelperService();
//   private isAuthenticated = new BehaviorSubject<boolean>(false);

//   constructor(private cookieService: CookieService) {
//     this.checkTokenOnInit();
//   }

//   checkTokenOnInit() {
//     // First check cookies
//     let token: string | null = this.cookieService.get('token') || null;
    
//     // If not in cookies, check localStorage as fallback
//     if (!token && typeof window !== 'undefined' && window.localStorage) {
//       const localStorageToken = localStorage.getItem('token');
//       if (localStorageToken) {
//         token = localStorageToken;
//         // If found in localStorage, migrate it to cookies
//         this.cookieService.set('token', localStorageToken, {
//           path: '/',
//           secure: true,
//           sameSite: 'Strict'
//         });
//         localStorage.removeItem('token'); // Clean up localStorage
//       }
//     }

//     if (token) {
//       if (!this.jwtHelper.isTokenExpired(token)) {
//         const decodedToken = this.jwtHelper.decodeToken(token);
//         console.log('Decoded Token:', decodedToken);
//         this.isAuthenticated.next(true);
//       } else {
//         console.warn('Token Expired');
//         this.clearSession();
//       }
//     } else {
//       console.warn('No Token Found');
//       this.clearSession(false);
//     }
//   }

//   isLoggedIn(): boolean {
//     return this.isAuthenticated.value;
//   }

//   login(token: string) {
//     // Store token in both cookie and localStorage for redundancy
//     this.cookieService.set('token', token, {
//       path: '/',
//       secure: true,
//       sameSite: 'Strict',
//       expires: 7 // 7 days expiration
//     });
    
//     if (typeof window !== 'undefined' && window.localStorage) {
//       localStorage.setItem('token', token);
//     }
    
//     this.isAuthenticated.next(true);
//   }

//   logout() {
//     this.clearSession();
//   }

//   private clearSession(navigate: boolean = true) {
//     this.cookieService.delete('token', '/');
//     this.cookieService.delete('userID', '/');
    
//     if (typeof window !== 'undefined' && window.localStorage) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('userID');
//       localStorage.removeItem('loginType');
//     }
    
//     this.isAuthenticated.next(false);

//     if (navigate) {
//       window.location.reload();
//     }
//   }
// }

import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

export interface DecodedCustomerToken {
  exp: number;
  customer_id?: string;
  customer_name?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwtHelper = new JwtHelperService();
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private cookieService: CookieService) {
    this.checkTokenOnInit();
  }

  decodeToken(token: string): DecodedCustomerToken | null {
    try {
      return this.jwtHelper.decodeToken(token);
    } catch (error) {
      console.error('[AuthService] Failed to decode token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('[AuthService] Error checking token expiration:', error);
      return true;
    }
  }

  getToken(): string | null {
    const cookieToken = this.cookieService.get('authToken');
    if (cookieToken) return cookieToken;

    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  getDecodedToken(): DecodedCustomerToken | null {
    const token = this.getToken();
    return token ? this.decodeToken(token) : null;
  }

  getTokenExpiry(): Date | null {
    const decoded = this.getDecodedToken();
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  }

  checkTokenOnInit() {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      const decoded = this.decodeToken(token);
      console.log('[AuthService] Decoded Token:', decoded);
      this.isAuthenticated.next(true);
    } else {
      console.warn('[AuthService] Token expired or not found');
      this.clearSession(false);
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  login(token: string, customerName: string) {
    const expires = this.getTokenExpiry();

    this.cookieService.set('authToken', token, {
      path: '/',
      secure: true,
      sameSite: 'Strict',
      ...(expires ? { expires } : {})
    });

    this.cookieService.set('customerName', customerName, {
      path: '/',
      secure: true,
      sameSite: 'Strict',
      ...(expires ? { expires } : {})
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('authToken', token);
    }

    this.isAuthenticated.next(true);
  }

  clearSession(navigate: boolean = true): void {
    this.cookieService.delete('authToken', '/');
    this.cookieService.delete('customerName', '/');

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('authToken');
    }

    this.isAuthenticated.next(false);

    if (navigate) window.location.reload();
  }
}
