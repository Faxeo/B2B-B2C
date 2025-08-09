import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../api.service';

interface SubCategoryRequest {
  level: number;
  parentID: number;
}

@Injectable({
  providedIn: 'root',
})
export class SubCategoryService {
  constructor(private apiService: ApiService) {}

  getSubCategories(level: number, parentID: number): Observable<any[]> {
    const requestPayload: SubCategoryRequest = {
      level: level,
      parentID: parentID,
    };

    return this.apiService.post<any[]>('Product/getSubCategories', requestPayload).pipe(
      map((response) => {
        // console.log(`SubCategoryService API Response (Level ${level}, ParentID ${parentID}):`, response);
        if (Array.isArray(response)) {
          return response; // Return the array directly since the response is not nested
        } else {
          console.error('SubCategoryService: Unexpected response format', response);
          return [];
        }
      }),
      catchError((error) => {
        console.error('SubCategoryService: Error fetching sub-categories', error);
        return [];
      })
    );
  }
}
