import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderTrackingService } from '../../../core/services/order-tracking/order-tracking.service';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TrackOrderComponent {
  trackingNumber: string = '';
  shipmentDetails: any = {}; // Holds the shipment details
  isLoading: boolean = false;
  errorMessage: string = ''; // Updated: Declaring errorMessage
  trackingData: any = null; // Updated: Declaring trackingData

  constructor(private orderTrackingService: OrderTrackingService) {}

  async trackShipment() {
    if (!this.trackingNumber.trim()) {
      this.errorMessage = 'Please enter a valid tracking number'; // Updated property name
      return;
    }

    this.isLoading = true;
    this.errorMessage = ''; // Updated property name
    this.trackingData = null;

    try {
      // Fetch tracking details using the service
      const data = await this.orderTrackingService.getTrackingDetails(this.trackingNumber);
      this.trackingData = data;
      if (this.trackingData?.trackResponse?.shipment?.[0]?.package?.[0]) {
        const packageData = this.trackingData.trackResponse.shipment[0].package[0];
        this.shipmentDetails = {
          trackingNumber: packageData.trackingNumber,
          agentReferenceNumber: this.trackingData.trackResponse.shipment[0].inquiryNumber,
          origin: 'Origin not provided',
          destination: 'Destination not provided',
          bookingDate: 'Date not available',
          currentStatus: packageData.currentStatus?.description || 'N/A',
        };
      } else {
        this.errorMessage = 'No shipment details found.';
      }
    } catch (err) {
      this.errorMessage = 'Failed to fetch tracking details'; // Updated property name
    } finally {
      this.isLoading = false;
    }
  }
}
