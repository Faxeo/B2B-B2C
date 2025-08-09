import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessProfileService {
  private apiUrl = `${environment.apiUrl}/Profile/getBusinessProfile`; // API endpoint for business profile

  constructor(private http: HttpClient) {}

  getBusinessProfile(userId: number, category: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { userID: userId, category: category };
    console.log('Sending request to getBusinessProfile with body:', body);
    return this.http.post<any>(this.apiUrl, body, { headers });
  }

  updateBusinessProfile(profile: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post('/api/updateBusinessProfile', profile, { headers });
  }
}
