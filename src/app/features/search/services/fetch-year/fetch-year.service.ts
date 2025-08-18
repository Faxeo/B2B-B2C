import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FetchYearService {
  constructor(private apiService: ApiService) {}

  fetchYears(requestData: any = {}): Observable<{ year: string }[]> {
    return this.apiService.post<{ year: string }[]>('Product/fetchYear', requestData);
  }
}
