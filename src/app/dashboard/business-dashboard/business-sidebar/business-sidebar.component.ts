import { Component, Output, EventEmitter } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation-service/navigation-service.service';

@Component({
  selector: 'app-business-sidebar',
  standalone: true,
  templateUrl: './business-sidebar.component.html',
  styleUrls: ['./business-sidebar.component.css']
})
export class BusinessSidebarComponent {
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
