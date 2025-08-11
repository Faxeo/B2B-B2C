import { Injectable } from '@angular/core';
import { HttpClient }    from '@angular/common/http';
import { Observable }    from 'rxjs';
import { environment }   from '../../../../environment';

@Injectable({ providedIn: 'root' })
export class BusinessProfileService {
  private apiUrl = `${environment.apiUrl}/Profile/getBusinessProfile`;

  constructor(private http: HttpClient) {}

  getBusinessProfile(userId: number, category: string): Observable<any> {
    const body = { userID: userId, category };
    console.log('Sending getBusinessProfile:', body);
    return this.http.post<any>(this.apiUrl, body);
  }

  updateBusinessProfile(profile: any): Observable<any> {
    console.log('Updating business profile:', profile);
    return this.http.post<any>(
      `${environment.apiUrl}/Profile/updateBusinessProfile`,
      profile
    );
  }
}
