import { Component } from '@angular/core';
import { BusinessSidebarComponent } from './business-sidebar/business-sidebar.component';
import { OrdersToShipComponent } from './orders-to-ship/orders-to-ship.component';
import { OrdersToReceiveComponent } from './orders-to-receive/orders-to-receive.component';
import { CommonModule, NgIf } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [
    BusinessSidebarComponent,
    OrdersToShipComponent,
    OrdersToReceiveComponent,
    ProfileComponent,
    CommonModule,
    NgIf,
  ],
  templateUrl: './business-dashboard.component.html',
  styleUrls: ['./business-dashboard.component.scss']
})
export class BusinessDashboardComponent {
  selectedComponent: string | null = null;

  selectComponent(component: string) {
    this.selectedComponent = component;
  }

  showDefaultView(): boolean {
    return this.selectedComponent === null;
  }
}
