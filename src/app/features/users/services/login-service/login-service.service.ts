import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';
import { decodeToken, isTokenExpired} from '../customer-login/customer-login.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginTypeSubject = new BehaviorSubject<string | null>(null);
  private userIDSubject = new BehaviorSubject<string | null>(null);
  private userNameSubject = new BehaviorSubject<string | null>(null);
  private categorySubject = new BehaviorSubject<string | null>(null);  


    /** Call this immediately after you get your token back from the server */
  setAuthToken(token: string): void {
    if (!token) {
      console.warn('[LoginService] Attempted to set null/empty token');
      return;
    }

    // Decode and validate token first
    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded)) {
      console.error('[LoginService] Invalid or expired token');
      this.clearData();
      return;
    }

    const expires = new Date(decoded.exp * 1000);
    console.log('[LoginService] Setting token with expiry:', expires);

    // Set in both localStorage and cookies for redundancy
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('authToken', token);
    }

    this.cookieService.set('authToken', token, {
      expires,
      path: '/',
      secure: true,
      sameSite: 'Strict'
    });
  }

  private getDecodedToken(): any | null {
    // now localStorage *and* cookie will contain the token
    const token = this.cookieService.get('authToken') || localStorage.getItem('authToken');
    return token ? decodeToken(token) : null;
  }

  private getTokenExpiry(): Date | null {
    const decoded = this.getDecodedToken();
    return decoded && decoded.exp
      ? new Date(decoded.exp * 1000)
      : null;
  }

  constructor(
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize immediately
      this.refreshFromStorage();
      
      // Also refresh when the page becomes visible again
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.refreshFromStorage();
        }
      });
    }
  }

    /** for debugging: snapshot of all the BehaviorSubjects’ current values */
  getCurrentState(): {
    loginType:  string | null;
    userID:     string | null;
    userName:   string | null;
    category:   string | null;
  } {
    return {
      loginType: this.loginTypeSubject.value,
      userID:    this.userIDSubject.value,
      userName:  this.userNameSubject.value,
      category:  this.categorySubject.value,
    };
  }


  /** Return the raw, current auth token (or null) */
  getRawToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) { return null; }
    // you wrote this.getDecodedToken() but that only returns the decoded payload.
    // instead grab the raw string:
    return this.cookieService.get('authToken') || localStorage.getItem('authToken');
  }


  refreshFromStorage(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  console.log('[LoginService] Refreshing from storage…');

  // Try to get token from cookie first, then localStorage
  const token = this.cookieService.get('authToken') || localStorage.getItem('authToken');
  if (!token) {
    console.log('[LoginService] No token found in storage');
    return;
  }

  // Validate token
  const decoded = decodeToken(token);
  if (!decoded || isTokenExpired(decoded)) {
    console.log('[LoginService] JWT expired or invalid, clearing data…');
    this.clearData();
    return;
  }

  console.log('[LoginService] Valid token found, restoring session state...');

  // Re-store token with proper expiry for redundancy
  const expires = new Date(decoded.exp * 1000);
  localStorage.setItem('authToken', token);
  this.cookieService.set('authToken', token, {
    path: '/',
    secure: true,
    sameSite: 'Strict',
    expires: expires
  });

  // token is valid; restore everything else
  const storedLoginType = localStorage.getItem('loginType') || this.cookieService.get('loginType');
  const storedUserID    = localStorage.getItem('userID')    || this.cookieService.get('userID');
  const storedUserName  = localStorage.getItem('username')  || this.cookieService.get('username');

  if (storedLoginType) this.loginTypeSubject.next(storedLoginType);
  if (storedUserID)    this.userIDSubject.next(storedUserID);
  if (storedUserName)  this.userNameSubject.next(storedUserName);
}


  setLoginType(loginType: string) {
    this.loginTypeSubject.next(loginType);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('loginType', loginType);
    }

    const expires = this.getTokenExpiry();
    if (expires) {
      this.cookieService.set('loginType', loginType, {
        expires,
        path: '/',
        secure: true,
        sameSite: 'Strict',
      });
    }
  }

  getLoginType(): Observable<string | null> {
    return this.loginTypeSubject.asObservable();
  }

  setUserID(userID: string) {
    this.userIDSubject.next(userID);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userID', userID);
    }

    const expires = this.getTokenExpiry();
    if (expires) {
      this.cookieService.set('userID', userID, {
        expires,
        path: '/',
        secure: true,
        sameSite: 'Strict',
      });
    }
    
  }

  getUserID(): Observable<string | null> {
    return this.userIDSubject.asObservable();
  }

  setUserName(userName: string) {
    this.userNameSubject.next(userName);

    console.log('[LoginService:setUserName] Called with:', userName);

    if (isPlatformBrowser(this.platformId)) {
      console.log('[LoginService:setUserName] Saving to localStorage:', userName);
      localStorage.setItem('username', userName);
    }

    const expires = this.getTokenExpiry();
    if (expires) {
      this.cookieService.set('username', userName, {
        expires,
        path: '/',
        secure: true,
        sameSite: 'Strict',
      });
    }
  }

  getUserName(): Observable<string | null> {
    return this.userNameSubject.asObservable();
  }

  setCategory(category: string) {
    this.categorySubject.next(category);
  }

  getCategory(): Observable<string | null> {
    return this.categorySubject.asObservable();
  }
    

  clearData() {
    this.loginTypeSubject.next(null);
    this.userIDSubject.next(null);
    this.userNameSubject.next(null);
    this.categorySubject.next(null);

    this.cookieService.delete('loginType', '/');
    this.cookieService.delete('userID', '/');
    this.cookieService.delete('username', '/');
    this.cookieService.delete('authToken', '/');

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loginType');
      localStorage.removeItem('userID');
      localStorage.removeItem('username');
      localStorage.removeItem('authToken');
    }
  }
}
