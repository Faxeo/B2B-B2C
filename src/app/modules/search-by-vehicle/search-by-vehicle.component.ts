import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventEmitter } from 'stream';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { VehicleSearchService } from '../../core/services/search-vehicle/search-vehicle.service';
import { DynamicSearchService } from '../../core/services/dynamic-search/dynamic-search.service';
import { FetchYearService } from '../../core/services/fetch-year/fetch-year.service';
import { FetchMakeService } from '../../core/services/fetch-make/fetch-make.service';
import { FetchChildService } from '../../core/services/fetch-child/fetch-child.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterSearchService } from '../../core/services/filter-search/filter-search.service';
import { CategoryNavbarSearchService } from '../../core/services/category-navbar-search/category-navbar-search.service';

@Component({
  selector: 'app-search-by-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search-by-vehicle.component.html',
  styleUrl: './search-by-vehicle.component.css',
})
export class SearchByVehicleComponent {
  @Input() searchResults: any[] = [];
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() isLoading: boolean = false;
  @Input() isPaginationLoading: boolean = false;
  @Input() loginType: string | null = null;

  // @Output() pageChange = new EventEmitter<number>();
  // @Output() vehicleSearchPageChange = new EventEmitter<number>();

  lastVehicleData: string = '';

  currentSearchType:
    | 'generalSearch'
    | 'vehicleSearch'
    | 'categorySearch'
    | null = null;

  @Input() searchType:
    | 'generalSearch'
    | 'vehicleSearch'
    | 'categorySearch'
    | 'filterCategorySearch'
    | null = null;

  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;
  showAlert: boolean = false;
  cartItemCount: number = 0;
  isLocallyLoading: boolean = false;
  notificationMessage: string = '';
  notificationAlert: string = '';
  showNotification: boolean = false;
  isCollapsed: boolean = false;
  searchQuery: string = '';
  vehicleData: any = {};

  years: any[] = [];
  makes: any[] = [];
  models: any[] = [];
  trims: any[] = [];
  engines: any[] = [];

  selectedYear: string | null = '';
  selectedMake: string | null = '';
  selectedModel: string | null = '';
  selectedTrim: string | null = '';
  selectedEngine: string | null = '';
  products: any[] = [];
  pageSize: number = 10;
  currentRequestData: any = {};

  activeSearchType: 'general' | 'category' | 'vehicle' = 'general';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private loginService: LoginService,
    private vehicleSearchService: VehicleSearchService,
    private dynamicSearchService: DynamicSearchService,
    private fetchYearService: FetchYearService,
    private fetchMakeService: FetchMakeService,
    private fetchChildService: FetchChildService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private filterSearchService: FilterSearchService,
    private categoryNavbarSearchService: CategoryNavbarSearchService
  ) {}

  ngOnInit(): void {
    this.getYears();
    if (isPlatformBrowser(this.platformId)) {
      this.userID = localStorage.getItem('userID');
      this.loginService.getUserID().subscribe((userID) => {
        this.userID = userID;
      });

      this.loginService.getLoginType().subscribe((loginType) => {
        this.loginType = loginType;
        if (this.loginType === 'business') {
          const username = localStorage.getItem('username');
          this.loginType = username || this.loginType;
        }
      });
    }

    this.activatedRoute.queryParams.subscribe((params) => {
      // Reset search results when params change
      this.searchResults = [];
      this.currentPage = 1;
      if (
        params['mainCategory'] ||
        params['firstSubCategory'] ||
        params['secondSubCategory']
      ) {
      } else if (
        params['year'] ||
        params['make'] ||
        params['model'] ||
        params['trim'] ||
        params['engine']
      ) {
        const vehicleData = {
          year: params['year'],
          make: params['make'],
          model: params['model'],
          trim: params['trim'],
          engine: params['engine'],
        };
        this.performVehicleSearch(vehicleData);
      }
    });
  }

  onSearchClick(): void {
    this.filterSearchService.clearAllFilters();
    this.categoryNavbarSearchService.clearCategoryData();
  }

  getYears(): void {
    this.fetchYearService.fetchYears().subscribe(
      (data: any[]) => {
        this.years = data.map((item) => ({ year: item.value_name }));
      },
      (error) => {
        console.error('Error fetching years:', error);
      }
    );
  }

  updateVehicleSelection(vehicle: any): void {
    this.vehicleSearchService.setVehicleData(vehicle);
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.fetchMakeService.fetchMakes(this.selectedYear).subscribe(
        (data: any[]) => {
          this.makes = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          // Reset dependent fields
          this.models = [];
          this.trims = [];
          this.engines = [];
          this.selectedMake = '';
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

  onMakeChange(): void {
    if (this.selectedMake) {
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
          this.updateVehicleSelection({ make: this.selectedMake });
          this.trims = [];
          this.engines = [];
          this.selectedModel = '';
          this.selectedTrim = '';
          this.selectedEngine = '';
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching models:', error);
        }
      );
    }
  }
  onModelChange(): void {
    if (this.selectedModel) {
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
          this.updateVehicleSelection({ model: this.selectedModel });
          this.selectedTrim = '';
          this.engines = [];
          this.selectedEngine = '';
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching trims:', error);
        }
      );
    }
  }

  onTrimChange(): void {
    if (this.selectedTrim) {
      const selectedTrimObject = this.trims.find(
        (trim) => trim.name === this.selectedTrim
      );
      const trimID = selectedTrimObject ? selectedTrimObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(trimID).subscribe(
        (data: any[]) => {
          this.engines = data.map((item) => ({ name: item.value_name }));
          this.updateVehicleSelection({ trim: this.selectedTrim });
          this.selectedEngine = '';
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching engines:', error);
        }
      );
    }
  }

  onEngineChange(): void {
    if (this.selectedEngine) {
      this.updateVehicleSelection({ engine: this.selectedEngine });
    } else {
      console.log('Engine is not selected');
    }
  }

  performVehicleSearch(vehicleData: any): void {
    // Set search type
    this.searchType = 'vehicleSearch';
    if (
      this.activeSearchType !== 'vehicle' ||
      this.lastVehicleData !== vehicleData
    ) {
      this.filterSearchService.clearSelectedBrand();
    }
    this.activeSearchType = 'vehicle';
    this.lastVehicleData = vehicleData;
    let selectedBrandId: number | null = null;
    // Subscribe to the brand observable to get the selected brand ID
    this.filterSearchService.selectedBrand$.subscribe((brandId) => {
      selectedBrandId = brandId;
    });

    // Set up initial request data structure for vehicle search
    this.currentRequestData = {
      ...this.currentRequestData,
      compatiblityValues: {
        ...this.currentRequestData.compatiblityValues,
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        trim: vehicleData.trim,
        engine: vehicleData.engine,
      },
      page: this.currentPage,
    };

    // Navigate to the /search route with query parameters for the vehicle data
    this.router.navigate(['/B2B/search'], {
      queryParams: {
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        trim: vehicleData.trim,
        engine: vehicleData.engine,
      },
    });

    // Display a loading indicator
    this.isLocallyLoading = true;

    // Call the vehicle search service
    this.dynamicSearchService.searchProducts(this.currentRequestData).subscribe(
      (response: any) => {
        console.log('Vehicle search response:', response);
        this.searchResults = response.products || [];
        this.totalPages = response.totalPages || 1;
        this.isLocallyLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error performing vehicle search:', error);
        this.isLocallyLoading = false;
      }
    );
  }
}
