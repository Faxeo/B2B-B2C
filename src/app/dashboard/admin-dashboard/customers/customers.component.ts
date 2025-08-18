import { Component, OnInit } from '@angular/core';
import { CustomersService } from '../../../shared/admin-customers/admin-customers.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
    selector: 'app-customers',
    imports: [],
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.isLoading = true;

    this.customersService.getCustomers()
      .pipe(
        catchError(error => {
          console.error('Error fetching customers:', error);
          this.errorMessage = 'Failed to load customers';
          this.isLoading = false;
          return of([]); // Return an empty array in case of error
        })
      )
      .subscribe((data) => {
        console.log('API Response:', data);
        this.customers = data;
        this.errorMessage = ''; // Clear any previous error messages
        this.isLoading = false;
      });
  }
}
