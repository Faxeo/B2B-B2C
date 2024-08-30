import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-business-sidebar',
  standalone: true,
  templateUrl: './business-sidebar.component.html',
  styleUrls: ['./business-sidebar.component.css']
})
export class BusinessSidebarComponent {
  @Output() componentSelected = new EventEmitter<string>();
  selectedComponent: string = ''; // Track selected component

  selectComponent(component: string) {
    this.selectedComponent = component; // Update selected component
    this.componentSelected.emit(component);
  }
}
