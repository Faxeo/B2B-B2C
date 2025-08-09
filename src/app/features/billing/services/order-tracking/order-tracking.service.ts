import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderTrackingService {
  constructor(private http: HttpClient) {}

  getTrackingDetails(trackingNumber: string, upsToken: string): Observable<any> {
    const queryParams = new URLSearchParams({
      locale: 'en_US',
      returnSignature: 'false',
      returnMilestones: 'false',
      returnPOD: 'false',
    }).toString();

    const endpoint = `https://wwwcie.ups.com/api/track/v1/details/${trackingNumber}?${queryParams}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${upsToken}`,
      transId: 'testing', // Update with a unique transaction ID
      transactionSrc: 'testing', // Match the value in the example
    });

    console.log('Request Endpoint:', endpoint);
    console.log('Request Headers:', headers);

    return this.http.get<any>(endpoint, { headers });
  }
}
