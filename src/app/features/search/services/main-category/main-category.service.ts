import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../../shared/api.service';

@Injectable({
  providedIn: 'root',
})
export class MainCategoryService {
  constructor(private apiService: ApiService) {}

  getMainCategories(): Observable<any[]> {
    return this.apiService.post<any[]>('Product/getMainCategory', {}).pipe(
      map((response) => {
        // console.log('MainCategoryService API Response:', response);
        if (Array.isArray(response)) {
          return response; // Return the array directly since the response is not nested
        } else {
          console.error('MainCategoryService: Unexpected response format', response);
          return [];
        }
      }),
      catchError((error) => {
        console.error('MainCategoryService: Error fetching main categories', error);
        return [];
      })
    );
  }
}
