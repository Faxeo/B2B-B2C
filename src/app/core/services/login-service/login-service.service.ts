import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginTypeSubject = new BehaviorSubject<string | null>(null);
  private userIDSubject = new BehaviorSubject<string | null>(null);
  private categorySubject = new BehaviorSubject<string | null>(null);

  setLoginType(loginType: string) {
    this.loginTypeSubject.next(loginType);
  }

  getLoginType() {
    return this.loginTypeSubject.asObservable();
  }

  setUserID(userID: string) {
    this.userIDSubject.next(userID); 
  }

  getUserID() {
    return this.userIDSubject.asObservable();
  }

  setCategory(category: string) {
    this.categorySubject.next(category);
  }

  getCategory() {
    return this.categorySubject.asObservable();
  }

  clearData() {
    this.loginTypeSubject.next(null);
    this.userIDSubject.next(null);
    this.categorySubject.next(null);
  }
}
