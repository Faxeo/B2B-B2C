import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeleteAddressService {
  constructor(private apiService: ApiService) {}

  // ✅ Method to delete an address by its ID
  deleteAddress(addressId: number): Observable<any> {
    const requestUrl = `Customers/DeleteAddressById?addressId=${addressId}`;

    console.log(`🔹 Deleting address with ID: ${addressId}`);
    console.log(`🔹 Request URL: ${requestUrl}`);

    return this.apiService.post<any>(requestUrl, {}).pipe(
      catchError(error => {
        console.error('❌ API error:', error);
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  }

  // ✅ Method to handle API error messages
  private getErrorMessage(error: any): string {
    if (error.error && error.error.errors) {
      return Object.entries(error.error.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return error.message || '❌ An unknown error occurred while deleting the address';
  }
}
