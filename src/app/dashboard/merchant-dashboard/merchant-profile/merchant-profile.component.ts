import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BusinessProfileService } from '../../../core/services/business-profile/business-profile.service';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-merchant-profile',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, NgChartsModule],
  templateUrl: './merchant-profile.component.html',
  styleUrl: './merchant-profile.component.css'
})
export class MerchantProfileComponent {
  businessProfile: any;
  errorMessage: string | null = null;
  isLoading = false;
  isUpdatingPic = false;
  isPicUpdated = false;
  selectedPic: string | ArrayBuffer | null = null;
  currentPassword = '';
  newPassword = '';

  // merchant-profile.component.ts
public lineChartType: 'line' = 'line';




  // —— Chart.js setup ——
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [], // timestamps
    datasets: [
      {
        data: [],
        label: 'Total Sales ($)',
        fill: false,
        tension: 0.4
      },
      {
        data: [],
        label: 'Units Sold',
        fill: false,
        tension: 0.4
      },
      {
        data: [],
        label: 'Avg Order Value ($)',
        fill: false,
        tension: 0.4
      },
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
  maintainAspectRatio: false,
    scales: {
      x: { 
        title: { display: true, text: 'Time' }
      },
      y: {
        title: { display: true, text: 'Value' }
      }
    },
    plugins: {
      legend: { position: 'top' }
    }
  };
  // public lineChartType: ChartType = 'line';

  private chartInterval: any;

  constructor(
    private businessProfileService: BusinessProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initProfile();
    this.initChart();
  }

  private initProfile(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userID');
    const category = 'merchant';

    if (token && userId) {
      this.isLoading = true;
      this.businessProfileService
        .getBusinessProfile(+userId, category, token)
        .subscribe({
          next: resp => {
            if (resp.success && resp.data) {
              this.businessProfile = resp.data;
            } else {
              this.errorMessage = 'Profile data not found';
            }
            this.isLoading = false;
          },
          error: err => {
            this.errorMessage = err.message;
            this.isLoading = false;
          }
        });
    } else {
      this.errorMessage = 'Not authenticated';
    }
  }

  private initChart(): void {
    // Seed with 6 points (past 30 seconds)
    const now = Date.now();
    for (let i = 5; i >= 0; i--) {
      this.pushChartPoint(new Date(now - i * 5000));
    }
    // Add new point every 5s
    this.chartInterval = setInterval(() => {
      this.pushChartPoint(new Date());
    }, 5000);
  }

  private pushChartPoint(time: Date) {
    // Dummy generators — replace with real API calls later
    const totalSales   = Math.round(Math.random() * 1000 + 500);
    const unitsSold    = Math.round(Math.random() * 50 + 10);
    const avgOrderVal  = +(totalSales / (unitsSold || 1)).toFixed(2);

    // push label
    this.lineChartData.labels!.push(time.toLocaleTimeString());
    // push dataset values
    this.lineChartData.datasets[0].data.push(totalSales);
    this.lineChartData.datasets[1].data.push(unitsSold);
    this.lineChartData.datasets[2].data.push(avgOrderVal);

    // keep only last 12 points (~1 minute)
    if (this.lineChartData.labels!.length > 12) {
      this.lineChartData.labels!.shift();
      this.lineChartData.datasets.forEach(ds => ds.data.shift());
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.chartInterval);
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

}