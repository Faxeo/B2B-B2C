import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FetchChildService {
  constructor(private apiService: ApiService) {}

  fetchChildren(parentID: number): Observable<any[]> {
    const requestData = { parentID: parentID };
    return this.apiService.post<any[]>('Product/fetchChild', requestData);
  }
  
}
 