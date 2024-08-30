import { Component, OnInit } from '@angular/core';
import { OrdersToShipService } from '../../../core/services/orders-to-ship/orders-to-ship.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-orders-to-ship',
  templateUrl: './orders-to-ship.component.html',
  styleUrls: ['./orders-to-ship.component.css'],   
  imports: [CommonModule],
})
export class OrdersToShipComponent implements OnInit {  
  orders: any[] = [];
  isLoading = false;
  errorMessage: string = '';

  constructor(private ordersToShipService: OrdersToShipService) {}

  ngOnInit() {
    this.fetchOrdersToShip();
  }

  fetchOrdersToShip() {
    this.isLoading = true;
    this.ordersToShipService.getOrdersToShip()
      .pipe(
        catchError(error => {
          console.error('Error fetching orders to ship:', error);
          this.errorMessage = 'Failed to load orders to ship';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((orders: any[]) => {
        console.log('API Response:', orders);  // Log the data to see the API response structure
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
