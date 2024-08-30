import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BusinessProfileService } from '../../../core/services/business-profile/business-profile.service';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  businessProfile: any;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private businessProfileService: BusinessProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userID');
      const category = 'business'; // Change this to business

      if (token && userId) {
        this.isLoading = true;
        this.businessProfileService
          .getBusinessProfile(+userId, category, token)
          .subscribe({
            next: (response) => {
              console.log('Business Profile API Response:', response);
              if (response.success && response.data) {
                this.businessProfile = response.data;
              } else {
                this.errorMessage = 'Error: Profile data not found or response unsuccessful';
              }
              this.isLoading = false;
            },
            error: (error) => {
              this.errorMessage = `Error fetching business profile: ${error.message}`;
              console.error('Error fetching business profile:', error);
              this.isLoading = false;
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
        this.isLoading = true;
        this.businessProfileService.updateBusinessProfile(this.businessProfile, token)
          .subscribe({
            next: (response) => {
              console.log('Profile updated successfully', response);
              this.isLoading = false;
            },
            error: (error) => {
              this.errorMessage = `Error updating profile: ${error.message}`;
              console.error('Error updating profile:', error);
              this.isLoading = false;
            },
          });
      } else {
        this.errorMessage = 'No authentication token found';
      }
    }
  }
}
