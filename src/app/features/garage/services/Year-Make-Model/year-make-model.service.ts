import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/api.service';
import { Observable } from 'rxjs';

export interface YearMakeModelResponse {
  success: boolean;
  statusCode: number;
  statusReason: string;
  data: {
    years: string[];
    makes: { make: string; models: string[] }[];
  };
}

@Injectable({ providedIn: 'root' })
export class YearMakeModelService {
  constructor(private api: ApiService) {}

  getHierarchy(): Observable<YearMakeModelResponse> {
    return this.api.post<YearMakeModelResponse>(
      'Product/GetYearMakeModelHierarchy',
      {}
    );
  }
}
