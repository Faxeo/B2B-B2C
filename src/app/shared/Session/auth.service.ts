import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

export interface DecodedToken {
  iat: number;
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

  decodeToken(token: string): DecodedToken | null {
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

  getDecodedToken(): DecodedToken | null {
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
      localStorage.setItem('customerName', customerName);
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