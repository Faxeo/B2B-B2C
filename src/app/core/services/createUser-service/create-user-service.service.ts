import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateUserServiceService {

  constructor(private apiService: ApiService) { }

  signup(userData: { name: string; email: string; password: string; contact: string }): Observable<any> {
    return this.apiService.post<any>('Profile/registerCustomer', userData);
  }
}
 