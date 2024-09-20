import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TrackOrderComponent {
  trackingNumber: string = '';
  shipmentDetails: any = {};

  trackShipment() {
    if (this.trackingNumber.trim()) {
      // Simulate an API call to fetch shipment details
      this.shipmentDetails = {
        trackingNumber: this.trackingNumber,
        agentReferenceNumber: 'AR123456789',
        origin: 'New York, USA',
        destination: 'Karachi, Pakistan',
        bookingDate: '2024-08-01',
        currentStatus: 'In Transit'
      };
    } else {
      this.shipmentDetails = {};
      alert('Please enter a valid tracking number.');
    }
  }
}
