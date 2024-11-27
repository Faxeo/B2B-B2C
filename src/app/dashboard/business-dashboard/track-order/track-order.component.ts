import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpsDetailsService } from '../../../core/services/ups-details/ups-details.service';

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

  constructor(private upsDetailsService: UpsDetailsService) {}

  async trackShipment() {
    if (!this.trackingNumber.trim()) {
      this.errorMessage = 'Please enter a valid tracking number';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    this.shipmentDetails = {};
  
    try {
      const response = await this.upsDetailsService.trackUpsOrder(this.trackingNumber).toPromise();
  
      console.log('API Response:', response);
  
      if (response?.trackResponse?.shipment?.[0]?.package?.[0]) {
        const packageData = response.trackResponse.shipment[0].package[0];
        const lastActivity = packageData.activity?.[0] || {};
  
        this.shipmentDetails = {
          trackingNumber: packageData.trackingNumber,
          agentReferenceNumber: response.trackResponse.shipment[0].inquiryNumber,
          origin: packageData.packageAddress.find((addr: any) => addr.type === 'ORIGIN')?.address.city || 'N/A',
          destination: packageData.packageAddress.find((addr: any) => addr.type === 'DESTINATION')?.address.stateProvince || 'N/A',
          bookingDate: packageData.deliveryDate?.[0]?.date || 'N/A',
          currentStatus: packageData.currentStatus?.description || 'N/A',
          lastActivity: {
            description: lastActivity.status?.description || 'No recent updates',
            date: lastActivity.date || 'N/A',
            time: lastActivity.time || 'N/A',
          },
          weight: packageData.weight?.weight || 'N/A',
          dimensions: `${packageData.dimension?.length} x ${packageData.dimension?.width} x ${packageData.dimension?.height} ${packageData.dimension?.unitOfDimension || ''}` || 'N/A',
          service: packageData.service?.description || 'N/A',
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
