import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessProfileService } from '../../../shared/business-profile/business-profile.service';

@Component({
    selector: 'app-Business-profile',
    imports: [FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  businessProfile: any;
  errorMessage: string | null = null;
  isLoading = false;
  isUpdatingPic = false;
  isPicUpdated = false;
  selectedPic: string | ArrayBuffer | null = null;
  currentPassword: string = '';
  newPassword: string = '';

  constructor(
    private businessProfileService: BusinessProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log('🔵 [ProfileComponent] ngOnInit() triggered');

    if (!isPlatformBrowser(this.platformId)) {
      console.warn('⚠️ Running on the server — profile data will not be loaded.');
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userID');
    const category = 'business';

    console.log(`🔍 Retrieved from localStorage → token: ${token ? '✅ present' : '❌ missing'}, userId: ${userId || '❌ missing'}`);

    if (token && userId) {
      this.isLoading = true;
      console.log('⏳ Fetching business profile from API...');

      this.businessProfileService
        .getBusinessProfile(+userId, category, token)
        .subscribe({
          next: (response) => {
            console.log('✅ API Response received:', response);

            if (response.success && response.data) {
              this.businessProfile = response.data;
              console.log('📄 businessProfile assigned:', this.businessProfile);
            } else {
              this.errorMessage = 'Error: Profile data not found or response unsuccessful';
              console.error('❌ API returned success=false or missing data');
            }

            this.isLoading = false;
            console.log('🔵 Profile loading finished');
          },
          error: (error) => {
            this.errorMessage = `Error fetching business profile: ${error.message}`;
            console.error('🚨 API error while fetching business profile:', error);
            this.isLoading = false;
          },
        });
    } else {
      this.errorMessage = 'No authentication token or user ID found';
      console.error('🚨 Missing token or user ID in localStorage');
    }
  }

  saveProfile(): void {
    console.log('💾 saveProfile() triggered');

    if (!isPlatformBrowser(this.platformId)) {
      console.warn('⚠️ Running on the server — profile cannot be saved.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No authentication token found';
      console.error('🚨 Cannot save profile — missing token');
      return;
    }

    this.isLoading = true;
    console.log('⏳ Sending profile update request to API...');

    this.businessProfileService.updateBusinessProfile(this.businessProfile, token)
      .subscribe({
        next: (response) => {
          console.log('✅ Profile updated successfully:', response);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = `Error updating profile: ${error.message}`;
          console.error('🚨 API error while updating profile:', error);
          this.isLoading = false;
        },
      });
  }

  triggerFileInput(): void {
    console.log('📷 triggerFileInput() triggered');
    const fileInput = document.getElementById('profilePicInput') as HTMLInputElement;
    if (fileInput) {
      console.log('✅ File input found, triggering click...');
      fileInput.click();
    } else {
      console.error('❌ File input element not found');
    }
  }

  onFileChange(event: any): void {
    console.log('📂 onFileChange() triggered');
    const file = event.target.files[0];

    if (!file) {
      console.warn('⚠️ No file selected');
      return;
    }

    console.log(`📄 File selected: ${file.name}, size: ${file.size} bytes`);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedPic = e.target.result;
      this.isUpdatingPic = true;
      this.isPicUpdated = false;
      console.log('✅ File loaded into selectedPic, ready for update');
    };
    reader.readAsDataURL(file);
  }

  proceedPicUpdate(): void {
    console.log('📸 proceedPicUpdate() triggered');

    if (this.selectedPic) {
      this.businessProfile.profilePic = this.selectedPic;
      this.isPicUpdated = true;
      this.isUpdatingPic = false;
      console.log('✅ Profile picture updated locally:', this.selectedPic);
    } else {
      console.warn('⚠️ No picture selected to proceed with update');
    }
  }

  reuploadPic(): void {
    console.log('♻️ reuploadPic() triggered — resetting picture update state');
    this.selectedPic = null;
    this.isUpdatingPic = false;
    this.isPicUpdated = false;
  }

  savePicUpdate(): void {
    console.log('💾 savePicUpdate() triggered');

    if (this.businessProfile.profilePic) {
      console.log('✅ Profile picture ready to be saved to server:', this.businessProfile.profilePic);
      // Place API call here if needed
    } else {
      console.warn('⚠️ No profile picture available to save');
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
