import { Component, OnInit } from '@angular/core';
import { ShippedOrdersService } from '../../../core/services/shipped-orders/shipped-orders.service'; // Adjust the path as necessary
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-orders-to-receive',
  templateUrl: './orders-to-receive.component.html',
  styleUrls: ['./orders-to-receive.component.css'],
})
export class OrdersToReceiveComponent implements OnInit {
  orders: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true; 

  constructor(private shippedOrdersService: ShippedOrdersService) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.isLoading = true;
       
    this.shippedOrdersService.getShippedOrders()
      .pipe(
        catchError(error => {
          console.error('Error fetching orders:', error);
          this.errorMessage = 'Failed to load orders';
          this.isLoading = false;
          return of([]); // Return an empty array in case of error
        })
      )
      .subscribe((orders: any[]) => {
        // console.log('API Response:', orders);  
        if (orders.length === 0) {
          this.errorMessage = 'No orders found'; // Display a user-friendly message if no orders are available
        } else {
          this.orders = orders;
          this.errorMessage = ''; // Clear any previous error messages
        }
        this.isLoading = false;
      });
  }  
}
