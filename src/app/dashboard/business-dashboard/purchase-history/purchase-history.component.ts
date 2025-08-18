
import { Component } from '@angular/core';

@Component({
    selector: 'app-purchase-history',
    templateUrl: './purchase-history.component.html',
    styleUrls: ['./purchase-history.component.css'],
    imports: []
})
export class PurchaseHistoryComponent {
  orders = [
    {
      orderDate: 'August 15, 2024',
      totalAmount: '$45.99', 
      shippedTo: 'Jane Doe',
      orderNumber: '114-1234567-8910111',
      orderStatus: 'Delivered August 18',
      deliveryDetails: 'Your package was delivered. It was handed directly to a resident.',
      items: [
        {
          name: 'Oil Filter - Premium Quality for Vehicles',
          // imageUrl: 'assets/oil-filter.jpg',
          returnEligible: 'Eligible through September 15, 2024'
        }
      ]
    },
    {
      orderDate: 'August 20, 2024',
      totalAmount: '$12.99',
      shippedTo: 'Jane Doe',
      orderNumber: '115-1234567-8910112',
      orderStatus: 'Delivered August 22',
      deliveryDetails: 'Your package was delivered. It was handed directly to a resident.',
      items: [
        {
          name: 'Wheel Lug Nut - Set of 4',
          // imageUrl: 'assets/wheel-lug-nut.jpg',
          returnEligible: 'Eligible through September 20, 2024'
        }
      ]
    }
  ];
}
