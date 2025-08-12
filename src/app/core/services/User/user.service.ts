import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userNameSubject = new BehaviorSubject<string | null>(null);
  private userEmailSubject = new BehaviorSubject<string | null>(null);

  constructor(private apiService: ApiService) {}

  /** Call API to get business user profile by ID */
  fetchUserNameById(userID: string, category: string = 'business'): void {
    const payload = { userID, category };

    console.log('[UserService] Sending request to getBusinessProfile with body:', payload);

    this.apiService.post<any>('Profile/getBusinessProfile', payload)
      .subscribe(response => {
        console.log('[UserService] API response:', response);

        const name = response?.data?.customer_name || response?.data?.company_name;
        const email = response?.data?.email || response?.data?.customer_email;

        if (name) {
          this.userNameSubject.next(name);
          console.log('[UserService] Set userName:', name);
        } else {
          console.warn('[UserService] No name found in response');
        }

        if (email) {
          this.userEmailSubject.next(email);
          console.log('[UserService] Set userEmail:', email);
        } else {
          console.warn('[UserService] No email found in response');
        }
      }, error => {
        console.error('[UserService] Error in fetchUserNameById:', error);
      });
  }

  getUserNameObservable() {
    return this.userNameSubject.asObservable();
  }

  getUserEmailObservable() {
    return this.userEmailSubject.asObservable();
  }
}
