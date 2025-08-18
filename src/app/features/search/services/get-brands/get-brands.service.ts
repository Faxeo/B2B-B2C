import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
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

  fetchAllBrands(requestData: any = {}): Observable<Brand[]> {
    return this.apiService.post<{ success: boolean; statusCode: number; statusReason: string; data: any[] }>(
      'Product/getAllBrands',
      requestData
    ).pipe(
      map((response) =>
        response.data.sort((a, b) => a.brand_name.localeCompare(b.brand_name)) // Sort by brand_name in ascending order
      )
    );
  }
}


export interface Brand {
  brand_id: number;
  brand_name: string;
  brand_image: string;
}