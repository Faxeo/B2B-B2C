import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ShippedOrdersService } from '../../../core/services/shipped-orders/shipped-orders.service';

interface ShippedOrder {
  orderDate: string;
  totalAmount: number;
  totalQuantity: number;
  transactionId: string;
  customer: string;
  orderStatus: string;
  orderTracking: string;
}

@Component({
  selector: 'app-shipped-orders',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './shipped-orders.component.html',
  styleUrls: ['./shipped-orders.component.css']
})
export class ShippedOrdersComponent implements OnInit {
  shippedOrders: ShippedOrder[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private shippedOrdersService: ShippedOrdersService) {}

  ngOnInit() {
    this.fetchShippedOrders();
  }

  fetchShippedOrders() {
    this.isLoading = true;
    this.error = null;
    this.shippedOrdersService.getShippedOrders().subscribe({
      next: (orders) => {
        // Map the API response to the ShippedOrder interface
        this.shippedOrders = orders.map(order => ({
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
          totalQuantity: order.totalQuantity,
          transactionId: order.transactionID,  // Mapping transaction ID
          customer: order.customerName,        // Mapping customer name
          orderStatus: order.orderStatus,
          orderTracking: order.trackingNumber  // Mapping order tracking
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching shipped orders:', error);
        this.error = 'Failed to load shipped orders. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
