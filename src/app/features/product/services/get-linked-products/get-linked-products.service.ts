import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GetLinkedProductsService {

  constructor(private apiService: ApiService) { }

  getLinkedProducts(productID: number): Observable<any[]> {
    const url = `Product/getLinkedProducts`; 
    
    const body = { productID: productID };

    return this.apiService.post<any[]>(url, body).pipe(
      map((response) => {
        // console.log('Linked Products Response:', response);
        return response; 
      }),
      catchError((error) => {
        console.error('Error fetching linked products:', error);
        return throwError(() => error);
      })
    );
  }
}