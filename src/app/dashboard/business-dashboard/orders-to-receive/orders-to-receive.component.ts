import { Component, OnInit } from '@angular/core';
import { ShippedOrdersService } from '../../../features/billing/services/shipped-orders/shipped-orders.service';
import { OrderDetailsService } from '../../../features/billing/services/order-details/order-details.service';
import { OrderShippingService } from '../../../features/billing/services/pending-orders/order-shipping/order-shipping.service';
import { catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    imports: [CommonModule, FormsModule],
    selector: 'app-orders-to-receive',
    templateUrl: './orders-to-receive.component.html',
    styleUrls: ['./orders-to-receive.component.css']
})
export class OrdersToReceiveComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  selectedOrderDetails: any = null;
  selectedOrderShipping: any = null;
  selectedOrderId: number | null = null;
  isLoadingDetails = false;
  copyMessage: string | null = null;

  constructor(
    private shippedOrdersService: ShippedOrdersService,
    private orderDetailsService: OrderDetailsService,
    private orderShippingService: OrderShippingService
  ) {}

  ngOnInit() {
    this.fetchOrdersToReceive();
  }

  fetchOrdersToReceive() {
    this.isLoading = true;
    this.errorMessage = null;
    this.shippedOrdersService
      .getShippedOrders()
      .pipe(
        catchError((error) => {
          console.error('Error fetching orders to receive:', error);
          this.errorMessage =
            'Failed to load orders to receive. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((orders) => {
        this.orders = orders;
        this.isLoading = false;
      });
  }

  showOrderDetails(orderID: number) {
    this.isLoadingDetails = true;
    this.selectedOrderDetails = null;
    this.selectedOrderShipping = null;
    this.selectedOrderId = orderID;

    forkJoin({
      details: this.orderDetailsService.getOrderDetail(orderID),
      shipping: this.orderShippingService.getOrderShipping(orderID),
    }).subscribe({
      next: ({ details, shipping }) => {
        this.selectedOrderDetails = details;
        this.selectedOrderShipping = shipping;
        this.isLoadingDetails = false;
      },
      error: (error) => {
        console.error('Error fetching order details and shipping:', error);
        this.errorMessage =
          'Failed to load order details and shipping. Please try again.';
        this.isLoadingDetails = false;
      },
    });
  }

  updateTracking(orderId: number, trackingDetails: string) {
    console.log(`Updating tracking for order ${orderId}: ${trackingDetails}`);
  }

  // Inside OrdersToReceiveComponent class

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
