import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GetBrandsService {
  constructor(private apiService: ApiService) {}

  fetchBrands(requestData: any = {}): Observable<{ id: number; name: string; selected: boolean }[]> {
    return this.apiService.post<{ id: number; name: string }[]>('Product/getBrands', requestData).pipe(
      map((brands: { id: number; name: string }[]) =>
        brands
          .sort((a, b) => a.name.localeCompare(b.name)) // Sort by name in ascending order
          .map((brand: { id: number; name: string }) => ({ ...brand, selected: false }))
      )
    );
  }  
}
