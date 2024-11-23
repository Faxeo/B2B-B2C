import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderTrackingService } from '../../../core/services/order-tracking/order-tracking.service';
import { UpsService } from '../../../core/services/ups/ups.service';

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
  errorMessage: string = ''; 
  trackingData: any = null; 
  upsToken: string = ''; // Store the fetched UPS token

  constructor(
    private orderTrackingService: OrderTrackingService,
    private upsService: UpsService
  ) {}

  async fetchUpsToken() {
    try {
      const requestData = { client_id: 'your-client-id', client_secret: 'your-client-secret' }; // Replace with actual payload
      const response = await this.upsService.getUpsToken(requestData).toPromise(); // Convert Observable to Promise
      console.log('Token Response:', response);
      this.upsToken = response.access_token; // Extract the token
      console.log('Fetched UPS Token:', this.upsToken);
    } catch (error) {
      this.errorMessage = 'Failed to fetch UPS token';
      console.error('Error fetching UPS Token:', error);
    }
  }

  async trackShipment() {
    if (!this.trackingNumber.trim()) {
      this.errorMessage = 'Please enter a valid tracking number';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    this.trackingData = null;
  
    try {
      // Fetch the UPS token before tracking the shipment
      await this.fetchUpsToken();
  
      // Fetch tracking details using the service
      const data = await this.orderTrackingService
        .getTrackingDetails(this.trackingNumber, this.upsToken)
        .toPromise();
  
      console.log('Full Response from UPS:', data); // Log the raw response for debugging
  
      if (data?.trackResponse?.shipment?.[0]?.package?.[0]) {
        const packageData = data.trackResponse.shipment[0].package[0];
        this.shipmentDetails = {
          trackingNumber: packageData.trackingNumber,
          agentReferenceNumber: data.trackResponse.shipment[0].inquiryNumber,
          origin: 'Origin not provided',
          destination: 'Destination not provided',
          bookingDate: 'Date not available',
          currentStatus: packageData.currentStatus?.description || 'N/A',
        };
      } else {
        this.errorMessage = 'No shipment details found.';
      }
    } catch (err) {
      this.errorMessage = 'Failed to fetch tracking details';
      console.error('Error fetching tracking details:', err);
    } finally {
      this.isLoading = false;
    }
  }  
}
