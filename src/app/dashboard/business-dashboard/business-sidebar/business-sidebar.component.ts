import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-business-sidebar',
  standalone: true,
  templateUrl: './business-sidebar.component.html',
  styleUrls: ['./business-sidebar.component.css']
})
export class BusinessSidebarComponent {
  @Input() isOpen: boolean = false;
  @Output() componentSelected = new EventEmitter<string>();
  selectedComponent: string = '';

  constructor() {}

  selectComponent(component: string): void {
    this.selectedComponent = component;
    this.componentSelected.emit(component);
  }
}