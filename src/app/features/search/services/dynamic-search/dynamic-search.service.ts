import { Injectable } from '@angular/core';
import { ApiService } from '../../../../../app/shared/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicSearchService {
  constructor(private apiService: ApiService) {}

  searchProducts(requestData: any): Observable<any> {
  return this.apiService.post<any>('Product/searchProducts', requestData);
}

}
 