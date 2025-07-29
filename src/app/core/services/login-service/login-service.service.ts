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

  constructor(
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.refreshFromStorage(); // 🔁 Hydrate at start
  }

  refreshFromStorage(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  // Option1: Use JWT token to validate session, if present
  const token = localStorage.getItem('authToken') || this.cookieService.get('authToken');
  if (token) {
    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded)) {
      console.log('[LoginService] JWT expired or invalid, clearing data...');
      this.clearData();
      return;
    }
  } else {
      // Fallback to sessionStart timestamp check (legacy logic)
      const sessionStart = localStorage.getItem('sessionStart');
      if (sessionStart) {
        const sessionStartDate = new Date(sessionStart);
        const now = new Date();
        const msInDay = 4 * 60 * 60 * 1000;  // 4 hours in ms
        if (now.getTime() - sessionStartDate.getTime() > msInDay) {
          console.log('[LoginService] Session expired based on sessionStart, clearing data...');
          this.clearData();
          return;
        }
      }
    }

    // Restore state from storage
    const storedLoginType = localStorage.getItem('loginType') || this.cookieService.get('loginType');
    const storedUserID = localStorage.getItem('userID') || this.cookieService.get('userID');
    const storedUserName = localStorage.getItem('username') || this.cookieService.get('username');

    console.log('[LoginService] Refreshing from storage...');

    if (storedUserName) {
      console.log('[LoginService] Setting userNameSubject from storage:', storedUserName);
      this.userNameSubject.next(storedUserName);
    }
    if (storedLoginType) this.loginTypeSubject.next(storedLoginType);
    if (storedUserID) this.userIDSubject.next(storedUserID);
  }


  setLoginType(loginType: string) {
    this.loginTypeSubject.next(loginType);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('loginType', loginType);
      localStorage.setItem('sessionStart', new Date().toISOString());
    }

    const expires = new Date();
    expires.setHours(expires.getDate() + 4); // Set cookie to expire in 4 hours
    this.cookieService.set('loginType', loginType, {
      expires,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
  }

  getLoginType(): Observable<string | null> {
    return this.loginTypeSubject.asObservable();
  }

  setUserID(userID: string) {
    this.userIDSubject.next(userID);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userID', userID);
      localStorage.setItem('sessionStart', new Date().toISOString());
    }

    const expires = new Date();
    expires.setHours(expires.getDate() + 4); // Set cookie to expire in 4 hrs
    this.cookieService.set('userID', userID, {
      expires,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
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

    const expires = new Date();
    expires.setHours(expires.getDate() + 4); // Set cookie to expire in 4 hrs
    this.cookieService.set('username', userName, {
      expires,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
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

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loginType');
      localStorage.removeItem('userID');
      localStorage.removeItem('username');
      localStorage.removeItem('sessionStart');
    }
  }
}
