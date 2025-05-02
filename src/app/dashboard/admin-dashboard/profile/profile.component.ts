import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { AdminProfileService } from '../../../core/services/admin-profile/admin-profile.service';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-merchant-profile',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  adminProfile: any;
  errorMessage: string | null = null;
  isLoading = false; // Track loading state

  constructor(
    private adminProfileService: AdminProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userID');
      const category = 'admin';

      if (token && userId) {
        this.isLoading = true; // Start loading
        this.adminProfileService
          .getAdminProfile(+userId, category, token)
          .subscribe({
            next: (response) => {
              console.log('Admin Profile API Response:', response);
              if (response.success && response.data) {
                this.adminProfile = response.data;
              } else {
                this.errorMessage =
                  'Error: Profile data not found or response unsuccessful';
              }
              this.isLoading = false; // Stop loading
            },
            error: (error) => {
              this.errorMessage = `Error fetching admin profile: ${error.message}`;
              console.error('Error fetching admin profile:', error);
              this.isLoading = false; // Stop loading
            },
          });
      } else {
        this.errorMessage = 'No authentication token or user ID found';
      }
    }
  }

  saveProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        this.isLoading = true; // Start loading
        this.adminProfileService.updateAdminProfile(this.adminProfile, token)
          .subscribe({
            next: (response) => {
              console.log('Profile updated successfully', response);
              this.isLoading = false; // Stop loading
            },
            error: (error) => {
              this.errorMessage = `Error updating profile: ${error.message}`;
              console.error('Error updating profile:', error);
              this.isLoading = false; // Stop loading
            },
          });
      } else {
        this.errorMessage = 'No authentication token found';
      }
    }
  }
}
