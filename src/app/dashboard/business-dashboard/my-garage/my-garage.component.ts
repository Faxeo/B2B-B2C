import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FetchYearService } from '../../../core/services/fetch-year/fetch-year.service';
import { FetchMakeService } from '../../../core/services/fetch-make/fetch-make.service';
import { FetchChildService } from '../../../core/services/fetch-child/fetch-child.service';
import { CompatibleProductsService } from '../../../core/services/compatible-products/compatible-products.service';
import { EventEmitter } from '@angular/core';
import { VehicleSearchService } from '../../../core/services/search-vehicle/search-vehicle.service';
import { AddVehicleService } from '../../../core/services/add-vehicle/add-vehicle.service';
import { LoginService } from '../../../core/services/login-service/login-service.service';
import { GetVehicleService } from '../../../core/services/get-vehicle/get-vehicle.service';
import { DeleteVehicleService } from '../../../core/services/delete-vehicle/delete-vehicle.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-my-garage',
  templateUrl: './my-garage.component.html',
  styleUrls: ['./my-garage.component.css'],
})
export class MyGarageComponent implements OnInit {
  years: { year: string }[] = [];
  makes: { name: string; cvalue_id: number }[] = [];
  models: { name: string; cvalue_id: number }[] = [];
  trims: { name: string; cvalue_id: number }[] = []; // Array for trims
  engines: { name: string }[] = [];
  compatibleProducts: any[] = [];
  allCompatibleProducts: any[] = []; // Store all fetched products
  getcompatibleProducts: any[] = []; // Products displayed on current page
  currentPage: number = 1; // Track current page
  pageSize: number = 5; // Number of products per page
  totalPages: number = 1; // Total number of pages
  notificationMessage: string = ''; // Holds the notification message
  showNotification: boolean = false; // Controls notification visibility
  selectedYear: string = '';
  selectedMake: string = '';
  selectedModel: string = '';
  selectedTrim: string = ''; // Variable for selected trim
  selectedEngine: string = '';
  loginType: string | null = null;
  userID: string | null = null;
  showDeleteModal: boolean = false; // Controls the visibility of the delete confirmation modal
  vehicleToDelete: number | null = null; // Holds the ID of the vehicle to be deleted

  @Output() formVisibilityChanged = new EventEmitter<boolean>();
  showVehicleForm: boolean = false;
  isLoading: boolean = false;
  demoVehicleData: any[] = []; // Initialize as an empty array

  constructor(
    private fetchYearService: FetchYearService,
    private fetchMakeService: FetchMakeService,
    private fetchChildService: FetchChildService,
    private compatibleProductsService: CompatibleProductsService,
    private changeDetectorRef: ChangeDetectorRef,
    private vehicleSearchService: VehicleSearchService,
    private addVehicleService: AddVehicleService,
    private loginService: LoginService,
    private getVehicleService: GetVehicleService,
    private deleteVehicleService: DeleteVehicleService
  ) {}

  ngOnInit(): void {
    this.getYears();
    this.userID = localStorage.getItem('userID');
    this.loginService.getUserID().subscribe((userID) => {
      this.userID = userID;
      console.log('User ID from localStorage:', this.userID);
      this.getVehicle();
    });
    this.loginService.getLoginType().subscribe((loginType) => {
      this.loginType = loginType;
      if (this.loginType === 'business') {
        const username = localStorage.getItem('username');
        // console.log('Username:', username);
        this.loginType = username || this.loginType;
      }
      console.log('Login type updated:', this.loginType);
    });
  }

  getVehicle(): void {
    const customerId = parseInt(localStorage.getItem('userID') || '0', 10);
    if (!customerId) {
      alert('Customer ID is missing. Please make sure you are logged in.');
      return;
    }

    this.getVehicleService.getCustomerVehicles(customerId).subscribe(
      (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.demoVehicleData = response.data.map((vehicle) => {
            console.log('Fetched vehicle data:', vehicle); // Log each vehicle
            vehicle.purchasedProducts = vehicle.products.filter(p => p.status === 'purchased');
            vehicle.searchedProducts = vehicle.products.filter(p => p.status === 'searched');
            return vehicle;
          });
        } else {
          console.error('Invalid response format:', response);
        }
      },
      (error) => {
        console.error('Error fetching vehicles:', error);
        alert('Failed to fetch vehicles. Please try again later.');
      }
    );
  }

  getYears(): void {
    this.fetchYearService.fetchYears().subscribe(
      (data: any[]) => {
        // console.log('Fetched Years:', data);
        this.years = data.map((item) => ({ year: item.value_name }));
      },
      (error) => {
        console.error('Error fetching years:', error);
      }
    );
  }

  addVehicleform(): void {
    this.showVehicleForm = true;
    this.formVisibilityChanged.emit(this.showVehicleForm);
  }

  closeVehicleForm(): void {
    // Reset form values
    this.selectedYear = '';
    this.selectedMake = '';
    this.selectedModel = '';
    this.selectedTrim = '';
    this.selectedEngine = '';
    page: this.currentPage, (this.compatibleProducts = []);
    this.showVehicleForm = false;
    this.formVisibilityChanged.emit(this.showVehicleForm);
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.vehicleSearchService.setVehicleData({ year: this.selectedYear }); // Store year

      this.fetchMakeService.fetchMakes(this.selectedYear).subscribe(
        (data: any[]) => {
          this.makes = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          this.selectedMake = '';
          this.models = [];
          this.trims = [];
          this.engines = [];
          this.selectedModel = '';
          this.selectedTrim = '';
          this.selectedEngine = '';
        },
        (error) => {
          console.error('Error fetching makes:', error);
        }
      );
    }
  }

  // Store the selected make in VehicleSearchService and fetch models
  onMakeChange(): void {
    if (this.selectedMake) {
      this.vehicleSearchService.setVehicleData({ make: this.selectedMake }); // Store make

      const selectedMakeObject = this.makes.find(
        (make) => make.name === this.selectedMake
      );
      const parentID = selectedMakeObject ? selectedMakeObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(parentID).subscribe(
        (data: any[]) => {
          this.models = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          this.selectedModel = '';
          this.trims = [];
          this.engines = [];
          this.selectedTrim = '';
          this.selectedEngine = '';
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching models:', error);
        }
      );
    }
  }

  // Store the selected model in VehicleSearchService and fetch trims
  onModelChange(): void {
    if (this.selectedModel) {
      this.vehicleSearchService.setVehicleData({ model: this.selectedModel }); // Store model

      const selectedModelObject = this.models.find(
        (model) => model.name === this.selectedModel
      );
      const modelID = selectedModelObject ? selectedModelObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(modelID).subscribe(
        (data: any[]) => {
          this.trims = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          this.selectedTrim = '';
          this.engines = [];
          this.selectedEngine = '';
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching trims:', error);
        }
      );
    }
  }

  // Store the selected trim in VehicleSearchService and fetch engines
  onTrimChange(): void {
    if (this.selectedTrim) {
      this.vehicleSearchService.setVehicleData({ trim: this.selectedTrim }); // Store trim

      const selectedTrimObject = this.trims.find(
        (trim) => trim.name === this.selectedTrim
      );
      const trimID = selectedTrimObject ? selectedTrimObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(trimID).subscribe(
        (data: any[]) => {
          this.engines = data.map((item) => ({ name: item.value_name }));
          this.selectedEngine = '';
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching engines:', error);
        }
      );
    }
  }

  updateVehicleSelection(vehicle: any) {
    this.vehicleSearchService.setVehicleData(vehicle); // Save vehicle data
    // console.log('Updated vehicle data:', vehicle);
  }

  // Store the selected engine in VehicleSearchService
  onEngineChange(): void {
    console.log('Selected Engine Before Update:', this.selectedEngine); // Log to see selected engine
    if (this.selectedEngine) {
      this.vehicleSearchService.setVehicleData({ engine: this.selectedEngine });
      console.log('Selected Engine After Update:', this.selectedEngine); // Log to confirm
    } else {
      console.log('Engine is not selected'); // Debug log
    }
  }

  displayNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;

    // Hide the notification after 3 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  addVehicle(): void {
    const vehicleData = this.vehicleSearchService.getVehicleData();

    if (
      !vehicleData.year ||
      !vehicleData.make ||
      !vehicleData.model ||
      !vehicleData.trim ||
      !vehicleData.engine
    ) {
      this.displayNotification(
        'Please ensure all vehicle details are selected before adding the vehicle.'
      );
      return;
    }

    this.vehicleSearchService.setVehicleData({
      ...vehicleData,
      customerID: this.userID ? parseInt(this.userID, 10) : 0,
    });

    this.addVehicleService.addCustomerVehicle().subscribe({
      next: (response) => {
        console.log('Vehicle added successfully:', response);
        this.displayNotification(
          'Vehicle has been added to your garage successfully.'
        );
        this.closeVehicleForm(); // Close the vehicle form after adding the vehicle
      },
      error: (error) => {
        console.error('Error adding vehicle:', error);
        this.displayNotification(
          'Failed to add the vehicle. Please try again later.'
        );
      },
    });
  }

  openDeleteModal(vehicle: any): void {
    this.vehicleToDelete = vehicle;
    this.showDeleteModal = true;
    this.changeDetectorRef.detectChanges(); // Ensure UI updates
    console.log("delete modal", this.showDeleteModal);
  }

  confirmDelete(): void {
    if (this.vehicleToDelete) {
      this.deleteVehicle(this.vehicleToDelete);
      this.showDeleteModal = false;
      this.vehicleToDelete = null;
      this.changeDetectorRef.detectChanges();
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.vehicleToDelete = null;
    this.changeDetectorRef.detectChanges();
  }
  
  deleteVehicle(vehicle: any): void {
    if (!vehicle.year || !vehicle.make || !vehicle.model || !vehicle.trim || !vehicle.engine) {
      console.error("Incomplete vehicle data:", vehicle);
      this.displayNotification("Vehicle data is incomplete. Unable to delete.");
      return;
    }
  
    const vehicleData = {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      engine: vehicle.engine,
      customerID: parseInt(this.userID || '0', 10),
    };
  
    this.deleteVehicleService.deleteVehicle(vehicleData).subscribe(
      (response) => {
        if (response.success) {
          this.displayNotification('Vehicle deleted successfully.');
          this.demoVehicleData = this.demoVehicleData.filter((v) => v.id !== vehicle.id);
        } else {
          console.error('Failed to delete vehicle:', response.statusReason);
          this.displayNotification('Failed to delete vehicle. Please try again later.');
        }
      },
      (error) => {
        console.error('Error deleting vehicle:', error);
        this.displayNotification('An error occurred while deleting the vehicle. Please try again later.');
      }
    );
  }
  

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getCompatibleProducts(); // Fetch the next page from the server
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getCompatibleProducts(); // Fetch the previous page from the server
    }
  }

  getCompatibleProducts(): void {
    this.isLoading = true;
    const requestData = {
      year: this.selectedYear,
      make: this.selectedMake,
      model: this.selectedModel,
      trim: this.selectedTrim,
      engine: this.selectedEngine,
      page: this.currentPage, // Include the current page in the request
      pageSize: this.pageSize, // Include the page size
    };

    // console.log('Request Payload:', requestData);

    this.compatibleProductsService.getCompatibleProducts(requestData).subscribe(
      (data: any) => {
        // console.log('Compatible Products:', data);
        this.allCompatibleProducts = data.products || []; // Ensure products are stored correctly
        this.totalPages = data.totalPages; // Get total pages from the API response
        this.compatibleProducts = this.allCompatibleProducts; // Update compatibleProducts with new page data
        this.isLoading = false;
        this.changeDetectorRef.detectChanges(); // Detect changes to update the view
      },
      (error) => {
        console.error('Error fetching compatible products:', error);
        alert(
          'Failed to fetch compatible products. Please check the console for more details.'
        );
        this.isLoading = false;
      }
    );
  }

  displayProducts(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.compatibleProducts = this.allCompatibleProducts.slice(start, end); // Show the current page's products
  }
}
