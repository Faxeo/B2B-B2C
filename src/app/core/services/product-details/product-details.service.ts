import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../api.service';

export interface ProductDetails {
  product_id: number;
  product_name: string;
  product_price: number;
  product_desp: string;
  product_image: string;
  images: { image_id: number; image_path: string }[];
  product_identifier2: string;
  product_origin: string;
  product_length: number;
  product_width: number;
  product_height: number;
  gross_weight: number;
  net_weight: number;
  pcs_per_box: number;
  pcs_per_carton: number;
  product_discounted_price: number;
  discount: number;
  reviews_count: number;
  category:string;
  subcategory: string;
  type: string;
  original_price: number;
  model_year: string;
  variants: string;
  companies: string;
  brand_name: string;
  brand: { brand_name: string; brand_desp: string};
  product_quantity: number;
  // mainImage : string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductDetailsService {
  constructor(private apiService: ApiService) {}

  /**
   * Fetch product details using POST request with query parameters
   */
  getProductByID(productID: number): Observable<ProductDetails> {
    const url = `Product/getProductByID?productID=${productID}`;
    
    return this.apiService.post<ProductDetails>(url, {}).pipe(
      map((response) => {
        console.log('API Response:', response);
        return response; // Return the response directly
      }),
      catchError((error) => {
        console.error('Error fetching product details:', error);
        return throwError(() => error);
      })
    );
  }
}
