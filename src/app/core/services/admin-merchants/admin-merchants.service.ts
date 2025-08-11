import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Merchant {
  merchantCreatedDate: string;
  merchantName: string;
  merchantEmail: string;
  merchantContact: string;
  merchantAddress: string;
  merchantStatus: boolean;
  merchantVerification: boolean;
}

interface MerchantsResponse {
  data: Merchant[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminMerchantsService {
  constructor(private apiService: ApiService) {}

  getMerchants(): Observable<Merchant[]> {
    return this.apiService.post<MerchantsResponse>('merchants/getAll', {}).pipe(
      map(response => response.data)
    );
  }
}
