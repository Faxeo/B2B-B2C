
import { Component } from '@angular/core';
import { MerchantSidebarComponent } from './merchant-sidebar/merchant-sidebar.component';
// import { ProfileComponent } from "../admin-dashboard/profile/profile.component";
import { MerchantProfileComponent } from './merchant-profile/merchant-profile.component';
// import { ProfileComponent } from './profile/profile.component';

@Component({
    selector: 'app-merchant-dashboard',
    imports: [MerchantSidebarComponent, MerchantProfileComponent],
    templateUrl: './merchant-dashboard.component.html',
    styleUrl: './merchant-dashboard.component.css'
})
export class MerchantDashboardComponent {
  selectedComponent: string = 'profile';
  
  showVehicleForm: boolean = false;

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