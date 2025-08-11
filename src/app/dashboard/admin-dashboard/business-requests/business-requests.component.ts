import { Component, OnInit } from '@angular/core';
import { BusinessRequestsService } from '../../../core/services/business-requests/business-requests.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-business-requests',
  templateUrl: './business-requests.component.html',
  styleUrls: ['./business-requests.component.css'],
  imports: [CommonModule],
})
export class BusinessRequestsComponent implements OnInit {
  requests: any[] = [];
  errorMessage: string = ''; 

  constructor(private businessRequestsService: BusinessRequestsService) {}

  ngOnInit() {
    this.fetchBusinessRequests();
  }

  fetchBusinessRequests() {
    const requestData = {
      // Include any necessary request data here
    };

    this.businessRequestsService.getBusinessRequests(requestData)
      .pipe(
        catchError(error => {
          console.error('Error fetching business requests:', error);
          this.errorMessage = 'Failed to load business requests';
          return of([]); // Return an empty array in case of error
        })
      )
      .subscribe((data) => {
        this.requests = data;
      });
  }

  handleAction(request: any) {
    console.log('Action clicked for:', request);
    // Handle the action (e.g., approve, reject)
  }
}
