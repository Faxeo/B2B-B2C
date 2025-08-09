// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { ApiService } from '../api.service';
// import { Observable } from 'rxjs';
// import { CookieService } from 'ngx-cookie-service';
// import { jwtDecode } from 'jwt-decode';

// export interface DecodedCustomerToken {
//   exp: number;
//   customer_id?: string;
//   customer_name?: string;
//   [key: string]: any;
// }

// export function decodeToken(token: string): DecodedCustomerToken | null {
//   try {
//     return jwtDecode(token);
//   } catch (error) {
//     console.error('Failed to decode token:', error);
//     return null;
//   }
// }

// export function isTokenExpired(decoded: DecodedCustomerToken): boolean {
//   const currentTime = Math.floor(Date.now() / 1000);    
//   return decoded.exp < currentTime;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class CustomerLoginService {
//   private decodedToken: DecodedCustomerToken | null = null;
  
//   private getDecodedToken(): DecodedCustomerToken | null {
//     const token = this.getToken();
//     return token ? decodeToken(token) : null;
//   }

//   private getTokenExpiry(): Date | null {
//     const decoded = this.getDecodedToken();
//     return decoded?.exp ? new Date(decoded.exp * 1000) : null;
//   }

//   constructor(
//     private apiService: ApiService,
//     private cookieService: CookieService,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     if (isPlatformBrowser(this.platformId)) {
//       // localStorage.setItem('sessionStart', new Date().toISOString());  //will be removed later
//       const token = this.getToken();
//       if (token) {
//         const decoded = decodeToken(token);
//         if (decoded && !isTokenExpired(decoded)) {
//           this.decodedToken = decoded;
//           console.log('[CustomerLoginService] Token decoded on init:', decoded);
//         } else {
//           this.clearCustomerData();
//         }
//       }
//     }
//   }

//   customerLogin(email: string, password: string): Observable<any> {
//     const requestData = { email, password };
//     return this.apiService.post<any>('Profile/customerLogin', requestData);
//   }

//   login(response: any): void {
//   if (!isPlatformBrowser(this.platformId)) return;

//   const token = response.token;
//   const customerName = response.response?.data?.customer_name;

//   if (token && customerName) {
//     const decoded = decodeToken(token);
//     if (decoded && !isTokenExpired(decoded)) {
//       this.decodedToken = decoded;

//       const expires = this.getTokenExpiry(); 
//       if (expires) {
//         this.cookieService.set('authToken', token, { expires, path: '/', secure: true, sameSite: 'Strict' });
//         this.cookieService.set('customerName', customerName, { expires, path: '/', secure: true, sameSite: 'Strict' });
//       }

//       localStorage.setItem('authToken', token);
//       console.log('[CustomerLoginService] Login decoded token:', decoded);
//       } else {
//         this.clearCustomerData();
//       }
//     }
//   }

//   getToken(): string | null {
//     if (!isPlatformBrowser(this.platformId)) return null;
//     return this.cookieService.get('authToken') || localStorage.getItem('authToken');
//   }

//   isLoggedIn(): boolean {
//     if (!isPlatformBrowser(this.platformId)) return false;
//     return this.decodedToken !== null && !isTokenExpired(this.decodedToken);
//   }

//   getCustomerName(): string | null {
//     if (!isPlatformBrowser(this.platformId)) return null;
//     return this.decodedToken?.customer_name || this.cookieService.get('customerName') || null;
//   }

//   getCustomerID(): string | null {
//   const id = this.decodedToken?.customer_id || this.decodedToken?.['id'] || null;
//   console.log('[CustomerLoginService] Returning customerID:', id);
//   return id;
//   }

//   clearCustomerData(): void {
//     if (!isPlatformBrowser(this.platformId)) return;
//     this.cookieService.delete('authToken');
//     this.cookieService.delete('customerName');
//     localStorage.removeItem('authToken');
//     this.decodedToken = null;
//   }
// }

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthService, DecodedCustomerToken } from '../Session/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerLoginService {
  private decodedToken: DecodedCustomerToken | null = null;

  constructor(
    private apiService: ApiService,
    private cookieService: CookieService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();
      if (token) {
        const decoded = this.authService.decodeToken(token);
        if (decoded && !this.authService.isTokenExpired(token)) {
          this.decodedToken = decoded;
          console.log('[CustomerLoginService] Token decoded on init:', decoded);
        } else {
          this.clearCustomerData();
        }
      }
    }
  }

  customerLogin(email: string, password: string): Observable<any> {
    return this.apiService.post<any>('Profile/customerLogin', { email, password });
  }

  login(response: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = response.token;
    const customerName = response.response?.data?.customer_name;

    if (token && customerName) {
      const decoded = this.authService.decodeToken(token);
      if (decoded && !this.authService.isTokenExpired(token)) {
        this.decodedToken = decoded;
        this.authService.login(token, customerName);
        console.log('[CustomerLoginService] Login decoded token:', decoded);
      } else {
        this.clearCustomerData();
      }
    }
  }

  getToken(): string | null {
    return this.authService.getToken();
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return this.decodedToken !== null && !this.authService.isTokenExpired(this.getToken() || '');
  }

  getCustomerName(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.decodedToken?.customer_name || this.cookieService.get('customerName') || null;
  }

  getCustomerID(): string | null {
    const id = this.decodedToken?.customer_id || this.decodedToken?.['id'] || null;
    console.log('[CustomerLoginService] Returning customerID:', id);
    return id;
  }

  clearCustomerData(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.authService.clearSession(false);
    this.decodedToken = null;
  }
}
