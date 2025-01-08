import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CustomerLoginService {
  constructor(private apiService: ApiService, private cookieService: CookieService) {}

  customerLogin(email: string, password: string): Observable<any> {
    const requestData = { 
      email: email, 
      password: password 
    };
    return this.apiService.post<any>('Profile/customerLogin', requestData);
  }

  login(response: any): void { 
    const token = response.token;
    const customerName = response.response.data.customer_name;
    if (token && customerName) {
      this.cookieService.set('authToken', token);
      this.cookieService.set('customerName', customerName);
    }
  }
}
