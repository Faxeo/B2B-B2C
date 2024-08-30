import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';  // Adjust the import path as necessary
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface CustomersResponse {
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  constructor(private apiService: ApiService) {}

  getCustomers(): Observable<any[]> {
    return this.apiService.post<CustomersResponse>('/customers/getAll', {}).pipe(
      map((response) => {
        return response.data;
      })
    );
  }
}
