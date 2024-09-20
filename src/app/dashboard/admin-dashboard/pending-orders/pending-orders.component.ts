import { Component, OnInit } from '@angular/core';
import { PendingOrdersService, PendingOrder } from '../../../core/services/pending-orders/pending-orders.service';
import { OrderDetailsService, OrderDetail } from '../../../core/services/order-details/order-details.service';
import { OrderShippingService, OrderShipping } from '../../../core/services/pending-orders/order-shipping/order-shipping.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pending-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-orders.component.html',
  styleUrls: ['./pending-orders.component.css']
})
export class PendingOrdersComponent implements OnInit {
  pendingOrders: PendingOrder[] = []; 
  isLoading = false;
  error: string | null = null;
  selectedOrderDetails: OrderDetail | null = null;
  selectedOrderShipping: OrderShipping | null = null;
  selectedPendingOrder: PendingOrder | null = null;
  isLoadingDetails = false;
  selectedOrderId: number | null = null;
  copyMessage: string | null = null;

  constructor(
    private pendingOrdersService: PendingOrdersService,
    private orderDetailsService: OrderDetailsService,
    private orderShippingService: OrderShippingService
  ) {}

  ngOnInit() {
    this.fetchPendingOrders();
  }

  fetchPendingOrders() {
    this.isLoading = true;
    this.error = null;
    this.pendingOrdersService.getPendingOrders().subscribe({
      next: (orders) => {
        this.pendingOrders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching pending orders:', error);
        this.error = 'Failed to load pending orders. Please try again.';
        this.isLoading = false;
      }
    });
  }

  showOrderDetails(orderID: number) {
    this.isLoadingDetails = true;
    this.selectedOrderDetails = null;
    this.selectedOrderShipping = null;
    this.selectedPendingOrder = this.pendingOrders.find(order => order.orderID === orderID) || null; // Assign the selected order
    this.selectedOrderId = orderID;
  
    forkJoin({
      details: this.orderDetailsService.getOrderDetail(orderID),
      shipping: this.orderShippingService.getOrderShipping(orderID)
    }).subscribe({
      next: ({ details, shipping }) => {
        this.selectedOrderDetails = details;
        this.selectedOrderShipping = shipping;
        this.isLoadingDetails = false;
      },
      error: (error) => {
        console.error('Error fetching order details and shipping:', error);
        this.error = 'Failed to load order details and shipping. Please try again.';
        this.isLoadingDetails = false;
      }
    });
  }
  
  updateTracking(orderId: number, trackingDetails: string) {
    // Implement the logic to update tracking details
    console.log(`Updating tracking for order ${orderId}: ${trackingDetails}`);
  }

  copyShippingDetails() {
    const shippingDetails = [
      `Name: ${this.selectedOrderShipping?.shippingName }`,  "\n" ,
      `Email: ${this.selectedOrderShipping?.shippingEmail }`,  "\n" ,
      `Address: ${decodeURIComponent(this.selectedOrderShipping?.address || '')}`
    ].join('\n'); 
  
    // Copy the formatted shipping details to the clipboard
    navigator.clipboard.writeText(shippingDetails).then(() => {
      this.copyMessage = "Copied!";
      setTimeout(() => {
        this.copyMessage = null;
      }, 2000); // Clear the message after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  } 
}
