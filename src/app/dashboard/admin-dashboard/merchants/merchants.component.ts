import { Component, OnInit } from '@angular/core';
import { AdminMerchantsService } from '../../../shared/admin-merchants/admin-merchants.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
    selector: 'app-merchants',
    imports: [],
    templateUrl: './merchants.component.html',
    styleUrls: ['./merchants.component.css']
})
export class MerchantsComponent implements OnInit {
  merchants: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private adminMerchantsService: AdminMerchantsService) {}

  ngOnInit() {
    this.loadMerchants();
  }

  loadMerchants() {
    this.isLoading = true;

    this.adminMerchantsService.getMerchants()
      .pipe(
        catchError(error => {
          console.error('Error fetching merchants:', error);
          this.errorMessage = 'Failed to load merchants. Please try again.';
          this.isLoading = false;
          return of([]); // Return an empty array in case of error
        })
      )
      .subscribe(data => {
        console.log('Fetched Merchants:', data);
        this.merchants = data;
        this.errorMessage = ''; // Clear any previous error messages
        this.isLoading = false;
      });
  }

  performAction(merchant: any): void {
    // Add the action logic here
    console.log('Action performed on:', merchant);
  }
}
