import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

interface Product {
  product: {
    product_id: number;
    product_name: string;
    product_price: number;
    product_identifier2: string;
    product_origin: string;
  };
  status: string;  // "purchased" or "searched"
}

interface Vehicle {
  customerId: number;
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  products: Product[];
  purchasedProducts?: Product[];  // Optional properties to handle filtered products
  searchedProducts?: Product[];
}


interface VehicleResponse {
  success: boolean;
  statusCode: number;
  statusReason: string;
  data: Vehicle[];
}

@Injectable({
  providedIn: 'root',
})
export class GetVehicleService {
  constructor(private apiService: ApiService) {}

  getCustomerVehicles(customerId: number): Observable<VehicleResponse> {
    const requestBody = { customerID: customerId };
    return this.apiService.post<VehicleResponse>('Customers/getCustomerVehicles', requestBody);
  }
}
