import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrderTrackingService {
  private proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  private upsApiUrl = 'https://wwwcie.ups.com/api/track/v1/details';
  private authUrl = 'https://wwwcie.ups.com/security/v1/oauth/token';

  private clientId = 'tTum9mV1BtEQWGe6MUzsgMGYQRsdYs5glDqQIEHpn9gpeRYu';
  private clientSecret = 'ah5q0Jm2pZ4NzbhwEZ4DdtKlxZtYoGoiI33IvJ3Bf5mYvd6CnM2nVxNFGKitVxQD';

  constructor(private http: HttpClient) {}

  // Method to get access token using Client ID and Client Secret
  private async getAccessToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    }).toString();

    const response = await fetch(`${this.proxyUrl}${this.authUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  // Method to fetch tracking details using access token
  async getTrackingDetails(trackingNumber: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const apiUrl = `${this.proxyUrl}${this.upsApiUrl}/${trackingNumber}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}
