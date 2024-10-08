import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject, fromEvent, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar/sidebar.component';
import { SidebarToggleService } from '../../core/services/sidebar-toggle/sidebar-toggle.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { LogoutService } from '../../core/services/logout-service/logout-service.service';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { CartService } from '../../core/services/cart/cart.service';
import { FormsModule } from '@angular/forms';
import { DynamicSearchService } from '../../core/services/dynamic-search/dynamic-search.service';
import { SearchComponent } from '../search/search.component';
import { FetchChildService } from '../../core/services/fetch-child/fetch-child.service';
import { FetchMakeService } from '../../core/services/fetch-make/fetch-make.service';
import { FetchYearService } from '../../core/services/fetch-year/fetch-year.service';
import { VehicleSearchService } from '../../core/services/search-vehicle/search-vehicle.service';
import { MainCategoryService } from '../../core/services/main-category/main-category.service';
import { SubCategoryService } from '../../core/services/sub-category/sub-category.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    SidebarComponent,
    FooterComponent,
    FormsModule,
    SearchComponent,
  ],
  providers: [ApiService, SidebarToggleService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit {
  categories$: Observable<any[]> | undefined;
  products$: Observable<any[]> | undefined; // For trending items
  searchProducts$: Observable<any[]> = of([]); // Initialize as empty array observable
  showingSearchResults: boolean = false; // Flag to toggle between trending and search results
  showSearchComponent: boolean = false; // Flag to control app-search visibility
  loginType: string | null = null;
  isAdminSidebarVisible: boolean = false;
  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;
  searchInput$ = new BehaviorSubject<string>(''); // Search input
  searchQuery: string = ''; // Store the search query entered by the user
  cartItemCount: number = 0; // Variable for cart item count
  isLoading: boolean = false; // Main loading flag
  isPaginationLoading: boolean = false; // Pagination loading flag
  totalPages: number = 0; // Initialize to 0 or another appropriate value
  currentPage: number = 1; // Start at the first page by default
  searchEnabled: boolean = false; // Controls whether the main search input is enabled or not
  searchPlaceholder: string = ''; // Placeholder for the main search bar based on button click
  showVehicleForm: boolean = false;
  selectedYear: string = '';
  selectedMake: string = '';
  selectedModel: string = '';
  selectedTrim: string = ''; // Variable for selected trim
  selectedEngine: string = '';
  years: { year: string }[] = [];
  makes: { name: string; cvalue_id: number }[] = [];
  models: { name: string; cvalue_id: number }[] = [];
  trims: { name: string; cvalue_id: number }[] = []; // Array for trims
  engines: { name: string }[] = [];
  currentSearchType: 'generalSearch' | 'vehicleSearch' | 'categorySearch' | null = null;
  hasSearched: boolean = false; // Track if a search has been performed at least once
  showMainSearchBar: boolean = false;
  mainCategories: { id: number; name: string }[] = [];
  firstSubCategories: { id: number; name: string }[] = [];
  secondSubCategories: { id: number; name: string }[] = [];
  selectedMainCategory: string = '';
  selectedFirstSubCategory: string = '';
  selectedSecondSubCategory: string = '';
  showCategoryForm: boolean = false;
  


  constructor(
    private apiService: ApiService,
    private sidebarToggleService: SidebarToggleService,
    private loginService: LoginService,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private logoutService: LogoutService,
    private dynamicSearchService: DynamicSearchService,
    private cdr: ChangeDetectorRef,
    private fetchYearService: FetchYearService,
    private fetchMakeService: FetchMakeService,
    private fetchChildService: FetchChildService,
    private changeDetectorRef: ChangeDetectorRef,
    private vehicleSearchService: VehicleSearchService,
    private mainCategoryService: MainCategoryService,
    private subCategoryService: SubCategoryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.getMainCategories();
    this.getYears();
    if (isPlatformBrowser(this.platformId)) {
      this.userID = localStorage.getItem('userID');
      // console.log('User ID from localStorage:', this.userID);
      this.loginService.getUserID().subscribe((userID) => {
        this.userID = userID;
        this.cartService.setUserDetails(this.userID, this.loginType);
      });

      this.loginService.getLoginType().subscribe((loginType) => {
        this.loginType = loginType;
        if (this.loginType === 'business') {
          const username = localStorage.getItem('username');
          // console.log('Username:', username);
          this.loginType = username || this.loginType;
        }
        console.log('Login type updated:', this.loginType);
        this.cartService.setUserDetails(this.userID, this.loginType);
      });
    } else {
      // console.log('Running in a non-browser environment');
    }

    // Initialize categories
    this.categories$ = this.apiService.getMainCategory().pipe(
      map((categories) =>
        categories.map((category: { name: string }) => ({
          ...category,
          image: `assets/car-parts-&-accessories.png`,
        }))
      )
    );

    // Trending products observable (default state)
    this.products$ = this.apiService.getProducts().pipe(
      map((products) =>
        products.map((product: { product_image: string }) => ({
          ...product,
          image: `${product.product_image}`,
          product_quantity: 1,
        }))
      )
    );

    // Set up the cart item count observable
    this.cartService.cartItemCount$.subscribe((count) => {
      this.cartItemCount = count;
    });
  }

  getMainCategories(): void {
    this.mainCategoryService.getMainCategories().subscribe(
      (data: any[]) => {
        // console.log('Main Categories API Response:', data);
        if (Array.isArray(data)) {
          this.mainCategories = data.map((category) => ({
            id: category.id,
            name: category.name,
          }));
          // console.log('Mapped Main Categories:', this.mainCategories);
        } else {
          console.error('Unexpected API response format or empty response:', data);
          this.mainCategories = []; // Assign an empty array to avoid further errors
        }
      },
      (error: any) => {
        console.error('Error fetching main categories:', error);
      }
    );
  }
  
  
  onMainCategoryChange(): void {
    if (this.selectedMainCategory) {
      this.subCategoryService.getSubCategories(1, Number(this.selectedMainCategory)).subscribe(
        (data: any[]) => {
          console.log('First Sub-Categories API Response:', data); // Debugging: Log the response
          if (Array.isArray(data)) {
            this.firstSubCategories = data.map((subCategory) => ({
              id: subCategory.id,
              name: subCategory.name,
            }));
          } else {
            console.error('Unexpected API response format for first sub-categories:', data);
            this.firstSubCategories = []; // Assign an empty array if the response is not as expected
          }
          this.selectedFirstSubCategory = '';
          this.secondSubCategories = [];
          this.selectedSecondSubCategory = '';
        },
        (error: any) => {
          console.error('Error fetching first sub-categories:', error);
        }
      );
    }
  }

  // Fetch second sub-categories based on selected first sub-category
  onFirstSubCategoryChange(): void {
    if (this.selectedFirstSubCategory) {
      this.subCategoryService.getSubCategories(2, Number(this.selectedFirstSubCategory)).subscribe(
        (data: any[]) => {
          // console.log('Second Sub-Categories API Response:', data); 
          if (Array.isArray(data)) {
            this.secondSubCategories = data.map((subCategory) => ({
              id: subCategory.id,
              name: subCategory.name,
            }));
          } else {
            console.error('Unexpected API response format for second sub-categories:', data);
            this.secondSubCategories = []; // Assign an empty array if the response is not as expected
          }
          this.selectedSecondSubCategory = '';
        },
        (error: any) => {
          console.error('Error fetching second sub-categories:', error);
        }
      );
    }
  }

  displaySearchBar(option: string): void {
    if (option === 'Category') {
      this.showCategoryForm = true;
      this.showVehicleForm = false; // Hide vehicle form when category form is shown
      this.getMainCategories(); // Fetch main categories when 'Category' is selected
      console.log('Category form should be visible now.'); // Debugging statement
    } else if (option === 'Vehicle') {
      this.showVehicleForm = true;
      this.showCategoryForm = false;
    } else {
      this.showCategoryForm = false;
      this.showVehicleForm = false;
    }
    this.cdr.detectChanges(); // Ensure the view is updated when the flag changes
  }
  

  searchByCategory(page: number = 1): void {
    this.currentSearchType = 'categorySearch';
  
    // Create request data for category search
    const requestData = {
      productName: "",
      manufacturer: "",
      compatibility: "",
      brand: "",
      description: "",
      upc: "",
      partNumber: "",
      attribute: "",
      includeCompatibility: false,
      includeManufacturer: false,
      includeAttribute: false,
      includeQuantity: false,
      includeImages: false,
      skip: (page - 1) * 10, // Skip logic for pagination
      take: 10, // Number of results per page
      m_id: this.selectedMainCategory ? Number(this.selectedMainCategory) : null, // Main Category ID
      f_id: this.selectedFirstSubCategory ? Number(this.selectedFirstSubCategory) : null, // First Sub-Category ID
      s_id: this.selectedSecondSubCategory ? Number(this.selectedSecondSubCategory) : null, // Second Sub-Category ID
      keyFeature: "",
      vendor: null,
      search_description: "",
      compatiblityValues: {
        compatibilityID: 0,
        productID: 0,
        sno: null,
        year: "",
        make: "",
        model: "",
        trim: "",
        engine: "",
        notes: "",
        isDeleted: null,
      },
      product_Attributes: "SELECT product_id FROM product_attributes_view WHERE concatenated_attributes LIKE '%%' order by product_id",
      attributeSearch: false,
      page: page // Current page number
    };
  
    console.log('Category Search Data:', requestData);
  
    // Call the dynamic search service with the category search request data
    this.dynamicSearchService.searchProducts(requestData).subscribe(
      (data: any) => {
        console.log('Category Search Results:', data.products); // Log the product results
  
        this.searchProducts$ = of(data.products || []);
        this.showCategoryForm = false; // Hide the category form once the results are shown
        this.showSearchComponent = true; // Ensure the search component is visible
        this.totalPages = data.totalPages || 1; // Set the total number of pages
        this.currentPage = page; // Update the current page
  
        // Reset loading indicators after data is received
        this.isLoading = false; // Stop the initial loading spinner
        this.isPaginationLoading = false; // Stop the pagination loading spinner
        this.cdr.detectChanges(); // Update the view
      },
      (error) => {
        console.error('Category Search Error:', error); // Log any errors
  
        // Stop loading spinners in case of an error
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      }
    );
  }
  
  updateVehicleSelection(vehicle: any) {
    this.vehicleSearchService.setVehicleData(vehicle); // Save vehicle data
    // console.log('Updated vehicle data:', vehicle); 
  }

  onSearchOptionClick(option: string): void {
    this.searchEnabled = true; // Enable the main search input
    this.searchPlaceholder = `Search By ${option}`; // Set the placeholder for the main search bar based on the clicked option
  }

  onSearchClick(): void {
    if (this.searchPlaceholder === 'Search By Vehicle') {
      this.showVehicleForm = true; // Show the vehicle form
    }
    else if (this.searchPlaceholder === 'Search By Category') {
      this.showCategoryForm = true; // Show the category form
    }
  }

  closeVehicleForm(): void {
    this.showVehicleForm = false; // Close the vehicle form
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

  onYearChange(): void {
    if (this.selectedYear) {
      this.fetchMakeService.fetchMakes(this.selectedYear).subscribe(
        (data: any[]) => {
          // console.log('Fetched Makes:', data);
          this.makes = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          // Save the selected year in the service
          this.updateVehicleSelection({ year: this.selectedYear });
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

  onMakeChange(): void {
    if (this.selectedMake) {
      const selectedMakeObject = this.makes.find(
        (make) => make.name === this.selectedMake
      );
      const parentID = selectedMakeObject ? selectedMakeObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(parentID).subscribe(
        (data: any[]) => {
          // console.log('Fetched Models:', data);
          this.models = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          // Save the selected make in the service
          this.updateVehicleSelection({ make: this.selectedMake });
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

  onModelChange(): void {
    if (this.selectedModel) {
      const selectedModelObject = this.models.find(
        (model) => model.name === this.selectedModel
      );
      const modelID = selectedModelObject ? selectedModelObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(modelID).subscribe(
        (data: any[]) => {
          // console.log('Fetched Trims:', data);
          this.trims = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          // Save the selected model in the service
          this.updateVehicleSelection({ model: this.selectedModel });
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

  onTrimChange(): void {
    if (this.selectedTrim) {
      const selectedTrimObject = this.trims.find(
        (trim) => trim.name === this.selectedTrim
      );
      const trimID = selectedTrimObject ? selectedTrimObject.cvalue_id : 0;

      this.fetchChildService.fetchChildren(trimID).subscribe(
        (data: any[]) => {
          // console.log('Fetched Engines:', data);
          this.engines = data.map((item) => ({ name: item.value_name }));
          // Save the selected trim in the service
          this.updateVehicleSelection({ trim: this.selectedTrim });
          this.selectedEngine = '';
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching engines:', error);
        }
      );
    }
  }

  onEngineChange(): void {
    if (this.selectedEngine) {
      // Update vehicle selection with engine
      this.updateVehicleSelection({ engine: this.selectedEngine });
      // console.log('Selected Engine:', this.selectedEngine); 
    } else {
      console.log('Engine is not selected'); // Debug log
    }
  } 

  searchByVehicle(page: number = 1): void {
    this.currentSearchType = 'vehicleSearch';
  
    // Retrieve stored vehicle data
    const vehicleData = this.vehicleSearchService.getVehicleData();
  
    // Get the search input value and trim it
    const searchInputElement = document.getElementById('search-input') as HTMLInputElement;
    const newSearchQuery = searchInputElement ? searchInputElement.value.trim() : '';
  
    // Check if it's a new search or a pagination request
    // Since newSearchQuery and this.searchQuery are both empty, let's add another condition to differentiate the initial search.
    if (!this.showSearchComponent || newSearchQuery !== this.searchQuery) {
      // console.log('New search detected or first search is being initiated. Setting initial loading to true.');
      this.isLoading = true; // Show the initial loading spinner for new search
      this.isPaginationLoading = false; // Reset pagination loading indicator
      this.searchQuery = newSearchQuery;
    } else {
      // console.log('Pagination detected. Setting pagination loading to true.');
      this.isLoading = false; // Hide initial loading for pagination
      this.isPaginationLoading = true; // Show pagination loading spinner
    }
  
    // Show the search component while loading
    this.showSearchComponent = true;
  
    // Set pagination parameters
    const take = 10;
    const skip = (page - 1) * take;
  
    // Prepare request data based on vehicle details and pagination
    const requestData = {
      productName: '',
      manufacturer: '',
      compatibility: '',
      brand: '',
      description: '',
      upc: '',
      partNumber: '',
      attribute: '',
      includeCompatibility: false,
      includeManufacturer: false,
      includeAttribute: false,
      includeQuantity: false,
      includeImages: false,
      skip: skip, // Pagination calculation (skip)
      take: take, // Number of results to take per page
      search_description: '',
      compatiblityValues: {
        compatibilityID: 0,
        productID: 0,
        sno: null,
        year: vehicleData.year, // Use stored vehicle data
        make: vehicleData.make, // Use stored vehicle data
        model: vehicleData.model, // Use stored vehicle data
        trim: vehicleData.trim, // Use stored vehicle data
        engine: vehicleData.engine, // Use stored vehicle data
        notes: '',
        isDeleted: null,
      },
      product_Attributes:
        "SELECT product_id FROM product_attributes_view WHERE concatenated_attributes LIKE '%%' order by product_id",
      attributeSearch: false,
      page: page, // Page number for the request
    };
    console.log('Request Data:', requestData);
  
    // Call dynamic search service with vehicle search request data
    this.dynamicSearchService.searchProducts(requestData).subscribe(
      (data: any) => {
        console.log('Vehicle Search Results:', data.products); // Log the product results
  
        this.searchProducts$ = of(data.products || []);
        this.showVehicleForm = false; // Hide the vehicle form once the results are shown
        this.showSearchComponent = true; // Ensure the search component is visible
        this.totalPages = data.totalPages || 1; // Set the total number of pages
        this.currentPage = page; // Update the current page
  
        // Reset loading indicators after data is received
        this.isLoading = false; // Stop the initial loading spinner
        this.isPaginationLoading = false; // Stop the pagination loading spinner
        this.cdr.detectChanges(); // Update the view
      },
      (error) => {
        console.error('Vehicle Search Error:', error); // Log any errors
  
        // Stop loading spinners in case of an error
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      }
    );
  }
  
  
  // In home.component.ts, inside the `onSearch` function:
  onSearch(page: number = 1): void {
    this.currentSearchType = 'generalSearch';
    const searchInputElement = document.getElementById(
      'search-input'
    ) as HTMLInputElement;
    const newSearchQuery = searchInputElement
      ? searchInputElement.value.trim()
      : '';
    this.isPaginationLoading = true;

    if (newSearchQuery !== this.searchQuery) {
      this.isLoading = true;
      this.searchQuery = newSearchQuery;
    } else {
      this.isPaginationLoading = true;
    }

    this.showSearchComponent = true;
    const take = 10;
    const skip = (page - 1) * take;

    const requestData = {
      productName: '',
      manufacturer: '',
      compatibility: '',
      brand: '',
      description: '',
      upc: '',
      partNumber: '',
      attribute: '',
      includeCompatibility: false,
      includeManufacturer: false,
      includeAttribute: false,
      includeQuantity: false,
      includeImages: false,
      skip: skip,
      take: take,
      search_description: this.searchQuery,
      compatiblityValues: {
        compatibilityID: 0,
        productID: 0,
        sno: null,
        year: '',
        make: '',
        model: '',
        trim: '',
        engine: '',
        notes: '',
        isDeleted: null,
      },
      product_Attributes:
        "SELECT product_id FROM product_attributes_view WHERE concatenated_attributes LIKE '%%' order by product_id",
      attributeSearch: false,
      page: page,
    };

    // Add the following log here to debug
    if (this.currentSearchType === 'generalSearch') {
      console.log('General Search Request Payload:', requestData);
    }

    this.dynamicSearchService
      .searchProducts(requestData)
      .pipe(
        map((response: any) => response || []),
        catchError((error) => {
          console.error('Error fetching products:', error);
          return of([]);
        })
      )
      .subscribe((products: any) => {
        console.log('General Search Results:', products);
        this.searchProducts$ = of(products.products);
        this.totalPages = products.totalPages || 1;
        this.currentPage = page;
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      });
  }

  onPageChange(page: number): void {
    // console.log('Current Search Type:', this.currentSearchType, 'Page:', page); 

    if (this.currentSearchType === 'generalSearch') {
      this.onSearch(page); // General search
    } else if (this.currentSearchType === 'vehicleSearch') {
      const vehicleData = this.vehicleSearchService.getVehicleData(); // Get stored vehicle data
      // console.log('Vehicle Data used in Pagination:', vehicleData);

      // Check if vehicle data is available before making a request
      if (
        vehicleData &&
        vehicleData.make &&
        vehicleData.model &&
        vehicleData.year &&
        vehicleData.trim &&
        vehicleData.engine
      ) {
        this.searchByVehicle(page); // Vehicle search, using saved vehicle data
      } else {
        console.warn('No vehicle data available for search.'); // Warn if no vehicle data is found
      }
    }
  }

  // Utility to toggle between trending and search products
  get displayedProducts$(): Observable<any[]> {
    return this.showingSearchResults ? this.searchProducts$! : this.products$!;
  }

  openSidebar() {
    this.sidebarToggleService.toggleSidebar();
  }

  toggleAdminSidebar() {
    this.isAdminSidebarVisible = !this.isAdminSidebarVisible;
  }

  logout() {
    this.logoutService.logout();
  }

  increaseQuantity(product: any): void {
    if (product.product_quantity < 99) {
      product.product_quantity += 1;
    }
  }

  decreaseQuantity(product: any): void {
    if (product.product_quantity > 1) {
      product.product_quantity -= 1;
    }
  }

  onQuantityInput(event: any, product: any): void {
    const inputQuantity = Number(event.target.value);
    product.product_quantity = inputQuantity > 0 ? inputQuantity : 1;
  }

  addToCart(product: {
    product_id: number;
    product_name: string;
    product_price: number;
    product_quantity: number;
    product_image: string;
    product_identifier2: string;
  }): void {
    if (!this.userID) {
      alert('Please log in to add items to your cart.');
      return;
    }
  
    const upc = product.product_identifier2;
  
    console.log('Adding product to cart:', product);
  
    // Pass `this.userID` as `businessId` and product quantity in the function call
    this.addToCartService
      .addToCart(
        product.product_id,          // productId
        this.userID,                 // userID (used as customerID)
        +this.userID,                // businessId (using userID as businessId)
        product.product_quantity     // product quantity
      )
      .subscribe({
        next: () => {
          this.addToCartService.updateCart(
            product.product_id.toString(),
            product.product_name,
            product.product_price,
            product.product_image,
            product.product_quantity,
            upc
          );
          this.displayMessage('Item added to cart successfully!');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          this.displayMessage('Error adding item to cart: ' + error.message);
        },
      });
  }
  

  displayMessage(msg: string): void {
    this.message = msg;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 1000);
  }
  

  closeForm(): void {
    this.showVehicleForm = false; // Hide the vehicle form
    this.showCategoryForm = false; // Hide category form if applicable
  }
  
}
