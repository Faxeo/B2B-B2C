import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginTypeSubject = new BehaviorSubject<string | null>(null);
  private userIDSubject = new BehaviorSubject<string | null>(null);
  private categorySubject = new BehaviorSubject<string | null>(null);

  constructor(private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize from stored values (only on the browser)
      const storedLoginType = localStorage.getItem('loginType') || this.cookieService.get('loginType');
      const storedUserID = localStorage.getItem('userID') || this.cookieService.get('userID');

      if (storedLoginType) this.loginTypeSubject.next(storedLoginType);
      if (storedUserID) this.userIDSubject.next(storedUserID);
    }
  }

  setLoginType(loginType: string) {
    this.loginTypeSubject.next(loginType);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('loginType', loginType);
    }
    this.cookieService.set('loginType', loginType, {
      path: '/',
      secure: true,
      sameSite: 'Strict'
    });
  }

  getLoginType(): Observable<string | null> {
    return this.loginTypeSubject.asObservable();
  }

  setUserID(userID: string) {
    this.userIDSubject.next(userID);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userID', userID);
    }
    this.cookieService.set('userID', userID, {
      path: '/',
      secure: true,
      sameSite: 'Strict'
    });
  }

  getUserID(): Observable<string | null> {
    return this.userIDSubject.asObservable();
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
    this.categorySubject.next(null);

    this.cookieService.delete('loginType', '/');
    this.cookieService.delete('userID', '/');

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loginType');
      localStorage.removeItem('userID');
    }
  }
}
