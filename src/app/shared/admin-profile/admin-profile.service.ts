import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class AdminProfileService {
  private apiUrl = `${environment.apiUrl}/Profile/getAdminProfile`; // Use the API URL from environment

  constructor(private http: HttpClient) {}

  getAdminProfile(userId: number, category: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { userID: userId, category: category };
    console.log('Sending request to getAdminProfile with body:', body);  // Add this line
    return this.http.post<any>(this.apiUrl, body, { headers });
  }
  
  updateAdminProfile(profile: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post('/api/updateAdminProfile', profile, { headers });
  }
}
