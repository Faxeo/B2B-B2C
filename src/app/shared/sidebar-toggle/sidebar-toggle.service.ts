import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarToggleService {
  private sidebarOpen = new BehaviorSubject<boolean>(false);

  toggleSidebar() {
    this.sidebarOpen.next(!this.sidebarOpen.value);
  }

  getSidebarState() {
    return this.sidebarOpen.asObservable();
  }
}
