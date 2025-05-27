import { Component } from '@angular/core';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { CustomersComponent } from './customers/customers.component';
import { MerchantsComponent } from './merchants/merchants.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { PendingOrdersComponent } from './pending-orders/pending-orders.component';
import { ProfileComponent } from './profile/profile.component';
import { ShippedOrdersComponent } from './shipped-orders/shipped-orders.component';
import { BusinessRequestsComponent } from './business-requests/business-requests.component';
import { CommonModule, NgIf } from '@angular/common';
import { LostSalesComponent } from './lost-sales/lost-sales.component';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [
    AdminSidebarComponent,
    CustomersComponent,
    MerchantsComponent,
    OrderSummaryComponent,
    PendingOrdersComponent,
    ProfileComponent,
    ShippedOrdersComponent,
    BusinessRequestsComponent,
    LostSalesComponent,
    CommonModule,
    NgIf,
  ],
})
export class AdminDashboardComponent {
  selectedComponent: string | null = null;

  selectComponent(component: string) {
    this.selectedComponent = component;
  }

  showDefaultView(): boolean {
    return this.selectedComponent === null;
  }
}





 // if (isPlatformBrowser(this.platformId)) {
    //   const token = localStorage.getItem('token');
    //   const userId = localStorage.getItem('userID');
    //   const category = 'admin';

    //   if (token && userId) {
    //     this.adminProfileService
    //       .getAdminProfile(+userId, category, token)
    //       .subscribe({
    //         next: (response) => {
    //           console.log('Admin Profile API Response:', response);
    //           if (response.success && response.data) {
    //             this.adminProfile = response.data;
    //           } else {
    //             this.errorMessage =
    //               'Error: Profile data not found or response unsuccessful';
    //           }
    //         },
    //         error: (error) => {
    //           this.errorMessage = `Error fetching admin profile: ${error.message}`;
    //           console.error('Error fetching admin profile:', error);
    //         },
    //       });
    //   } else {
    //     this.errorMessage = 'No authentication token or user ID found';
    //   }
    // }