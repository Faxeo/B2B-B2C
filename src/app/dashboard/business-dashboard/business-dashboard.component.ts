import { Component } from '@angular/core';

import { BusinessSidebarComponent } from './business-sidebar/business-sidebar.component';
import { OrdersToShipComponent } from './orders-to-ship/orders-to-ship.component';
import { OrdersToReceiveComponent } from './orders-to-receive/orders-to-receive.component';
import { ProfileComponent } from './profile/profile.component';
import { MyGarageComponent } from './my-garage/my-garage.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { TrackOrderComponent } from './track-order/track-order.component';

@Component({
    selector: 'app-business-dashboard',
    imports: [
    BusinessSidebarComponent,
    OrdersToShipComponent,
    OrdersToReceiveComponent,
    ProfileComponent,
    MyGarageComponent,
    PurchaseHistoryComponent,
    TrackOrderComponent,
    PurchaseHistoryComponent
],
    templateUrl: './business-dashboard.component.html',
    styleUrls: ['./business-dashboard.component.scss']
})
export class BusinessDashboardComponent {
  selectedComponent: string | null = null;
  showVehicleForm = false;

  selectComponent(component: string) {
    this.selectedComponent = component;
  }
  
  showDefaultView(): boolean {
    return this.selectedComponent === null;
  }

  updateFormVisibility(isVisible: boolean): void {
    this.showVehicleForm = isVisible;
  }
}