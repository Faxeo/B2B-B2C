import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  @Output() componentSelected = new EventEmitter<string>();
  selectedComponent: string = ''; // Track selected component

  selectComponent(component: string) {
    this.selectedComponent = component; // Update selected component
    this.componentSelected.emit(component);
  }
}
   