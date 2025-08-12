import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BusinessProfileService } from '../../../core/services/business-profile/business-profile.service';
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
  businessProfile: any;
  errorMessage: string | null = null;
  isLoading = false;
  isUpdatingPic = false;  // State for profile picture update
  isPicUpdated = false;   // State for picture update completion
  selectedPic: string | ArrayBuffer | null = null;
  currentPassword: string = '';
  newPassword: string = '';

  constructor(
    private businessProfileService: BusinessProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userID');
      const category = 'business';

      if (token && userId) {
        this.isLoading = true;
        this.businessProfileService
          .getBusinessProfile(+userId, category,)
          .subscribe({
            next: (response) => {
              console.log('Business Profile API Response:', response);
              console.log('Business Profile Data:', response.data);
              if (response.success && response.data) {
                this.businessProfile = response.data;
                console.log('Business Profile Data:', this.businessProfile);
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
        this.businessProfileService.updateBusinessProfile(this.businessProfile,)
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

  triggerFileInput(): void {
    const fileInput = document.getElementById('profilePicInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedPic = e.target.result;
        this.isUpdatingPic = true;
        this.isPicUpdated = false; // Reset pic update state if new file is chosen
      };
      reader.readAsDataURL(file);
    }
  }

  proceedPicUpdate(): void {
    if (this.selectedPic) {
      this.businessProfile.profilePic = this.selectedPic;
      this.isPicUpdated = true;
      this.isUpdatingPic = false;
    }
  }

  reuploadPic(): void {
    this.selectedPic = null;
    this.isUpdatingPic = false;
    this.isPicUpdated = false;
    // Show the "Update Profile Picture" button again
  }

  savePicUpdate(): void {
    if (this.businessProfile.profilePic) {
      // Optionally, save the updated picture to the server here
      console.log('Profile picture saved:', this.businessProfile.profilePic);
      // You might want to handle saving the updated picture to your server
    }
  }

  // changePassword(): void {
  //   if (isPlatformBrowser(this.platformId)) {
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //       this.isLoading = true;
  //       this.businessProfileService.changePassword(this.currentPassword, this.newPassword, token)
  //         .subscribe({
  //           next: (response) => {
  //             console.log('Password changed successfully', response);
  //             this.isLoading = false;
  //           },
  //           error: (error) => {
  //             this.errorMessage = `Error changing password: ${error.message}`;
  //             console.error('Error changing password:', error);
  //             this.isLoading = false;
  //           },
  //         });
  //     } else {
  //       this.errorMessage = 'No authentication token found';
  //     }
  //   }
  // }
}
