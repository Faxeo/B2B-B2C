import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddAddressService {
  constructor(private apiService: ApiService) {}

  addAddress(addressData: {
    customerId: number;
    fullName: string;
    streetAddressLine1: string;
    streetAddressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
    email: string;
    latitude: number;
    longitude: number;
    addressType: string;
    isPrimary: boolean;
  }): Observable<any> {
    console.log('Sending address data to API:', addressData);

    return this.apiService.post<any>('Customers/AddCustomerAddress', addressData).pipe(
      catchError(error => {
        console.error('API error:', error);
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  }

  private getErrorMessage(error: any): string {
    if (error.error && error.error.errors) {
      return Object.entries(error.error.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return error.message || 'An unknown error occurred while adding the address';
  }
}
