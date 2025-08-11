import { Component, OnInit } from '@angular/core';
import { ShippedOrdersService } from '../../../core/services/shipped-orders/shipped-orders.service';
import { OrderDetailsService } from '../../../core/services/order-details/order-details.service';
import { OrderShippingService } from '../../../core/services/pending-orders/order-shipping/order-shipping.service';
import { catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-orders-to-receive',
  templateUrl: './orders-to-receive.component.html',
  styleUrls: ['./orders-to-receive.component.css'],
})
export class OrdersToReceiveComponent implements OnInit {
  // Bootstrap Icons mapping
  icons = {
    boxOpen: 'bi-box-seam',
    clipboardList: 'bi-clipboard-check',
    infoCircle: 'bi-info-circle',
    truck: 'bi-truck',
    fileInvoice: 'bi-receipt',
    copy: 'bi-clipboard',
    save: 'bi-save',
    syncAlt: 'bi-arrow-repeat',
    fileExport: 'bi-download',
    search: 'bi-search'
  };
  
  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  selectedOrderDetails: any = null;
  selectedOrderShipping: any = null;
  selectedOrderId: number | null = null;
  isLoadingDetails = false;
  copyMessage: string | null = null;
  searchTerm = '';

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
          this.errorMessage = 'Failed to load orders to receive. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((orders) => {
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.isLoading = false;
      });
  }

  filterOrders() {
    if (!this.searchTerm) {
      this.filteredOrders = [...this.orders];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredOrders = this.orders.filter(order => 
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.transactionID && order.transactionID.toLowerCase().includes(term)) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(term)) ||
      (order.orderStatus && order.orderStatus.toLowerCase().includes(term))
    );
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
        this.errorMessage = 'Failed to load order details and shipping. Please try again.';
        this.isLoadingDetails = false;
      },
    });
  }

  updateTracking(orderId: number, trackingDetails: string) {
    // Implement actual tracking update logic here
    console.log(`Updating tracking for order ${orderId}: ${trackingDetails}`);
    // Add service call to update tracking in backend
  }

  exportOrders() {
    // Implement actual export logic here
    console.log('Exporting orders...');
    // This would typically generate a CSV or Excel file
  }

  decodeURI(uri: string): string {
    return uri ? decodeURIComponent(uri) : '';
  }

  copyShippingDetails() {
    if (!this.selectedOrderShipping) return;
    
    const shippingDetails = [
      `Name: ${this.selectedOrderShipping.shippingName || 'N/A'}`,
      `Email: ${this.selectedOrderShipping.shippingEmail || 'N/A'}`,
      `Address: ${this.decodeURI(this.selectedOrderShipping.address) || 'N/A'}`
    ].join('\n');

    navigator.clipboard.writeText(shippingDetails).then(() => {
      this.copyMessage = 'Copied!';
      setTimeout(() => {
        this.copyMessage = null;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
}