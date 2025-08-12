import { Component, Output, EventEmitter, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; // Import Subscription
import { UserService } from '../../../core/services/User/user.service'; // Adjust the path as needed

@Component({
  selector: 'app-business-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-sidebar.component.html',
  styleUrls: ['./business-sidebar.component.css']
})
export class BusinessSidebarComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() componentSelected = new EventEmitter<string>();
  selectedComponent: string = '';
  username: string = '';
  email: string = '';
  private subscriptions = new Subscription();

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = localStorage.getItem('userID');

      // Get initial values from localStorage
      this.username = localStorage.getItem('username') || '';
      this.email = localStorage.getItem('email') || '';

      // Subscribe to the user name and email observables
      this.subscriptions.add(this.userService.getUserNameObservable().subscribe(name => {
        if (name) {
          this.username = name;
          localStorage.setItem('username', name);
        }
      }));

      this.subscriptions.add(this.userService.getUserEmailObservable().subscribe(email => {
        if (email) {
          this.email = email;
          localStorage.setItem('email', email);
        }
      }));

      if (userId) {
        // Trigger the API call via the service to update data
        this.userService.fetchUserNameById(userId);
      } else {
        console.warn('User ID not found in localStorage.');
      }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  selectComponent(component: string): void {
    this.selectedComponent = component;
    this.componentSelected.emit(component);
  }
}