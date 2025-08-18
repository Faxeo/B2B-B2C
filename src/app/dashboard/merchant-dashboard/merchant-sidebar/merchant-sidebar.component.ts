import { Component, Output, EventEmitter } from '@angular/core';
import { NavigationService } from '../../../shared/navigation-service/navigation-service.service';

@Component({
    selector: 'app-merchant-sidebar',
    imports: [],
    templateUrl: './merchant-sidebar.component.html',
    styleUrl: './merchant-sidebar.component.css'
})
export class MerchantSidebarComponent {
  @Output() componentSelected = new EventEmitter<string>();
  selectedComponent: string = ''; // Track selected component
  constructor(
    private navigationService: NavigationService
  ) {}

  onBackClick(): void {
    this.navigationService.goBack();
  }
  selectComponent(component: string) {
    this.selectedComponent = component; // Update selected component
    this.componentSelected.emit(component);
  }
}
