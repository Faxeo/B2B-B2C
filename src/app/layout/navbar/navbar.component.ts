import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  @Input() loginType: string | null = null;
  @Input() cartItemCount: number = 0;

  onSearch(): void {
    // Handle search functionality
    console.log('Search triggered');
  }

  openSidebar(): void {
    console.log('Open login/sign-up sidebar');
  }

  toggleAdminSidebar(): void {
    console.log('Toggle admin sidebar');
  }
}
