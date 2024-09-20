import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FetchMakeService {
  constructor(private apiService: ApiService) {}

  fetchMakes(year: string): Observable<{ name: string }[]> {
    const requestData = { year: year };
    return this.apiService.post<{ name: string }[]>('Product/fetchMake', requestData);
  }
}
