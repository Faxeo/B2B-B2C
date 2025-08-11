import { Component, HostListener } from '@angular/core';
import { BusinessSidebarComponent } from './business-sidebar/business-sidebar.component';
import { OrdersToShipComponent } from './orders-to-ship/orders-to-ship.component';
import { OrdersToReceiveComponent } from './orders-to-receive/orders-to-receive.component';
import { CommonModule, NgIf } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { MyGarageComponent } from './my-garage/my-garage.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { TrackOrderComponent } from './track-order/track-order.component';
import { NavigationService } from '../../core/services/navigation-service/navigation-service.service';

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
    MyGarageComponent,
    PurchaseHistoryComponent,
    TrackOrderComponent
  ],
  templateUrl: './business-dashboard.component.html',
  styleUrls: ['./business-dashboard.component.scss']
})
export class BusinessDashboardComponent {
  constructor(private navigationService: NavigationService) {}

  selectedComponent: string | null = null;
  sidebarOpen: boolean = false;
  isSmallScreen: boolean = false;
  showVehicleForm: boolean = false;

  selectComponent(component: string) {
    this.selectedComponent = component;
    this.sidebarOpen = false; // close sidebar after selection on mobile
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onBackClick(): void {
    this.navigationService.goBack();
  }

  showDefaultView(): boolean {
    return this.selectedComponent === null;
  }

  updateFormVisibility(isVisible: boolean): void {
    this.showVehicleForm = isVisible;
  }
}
