import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { BehaviorSubject, fromEvent, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../layout/sidebar/sidebar/sidebar.component';
import { SidebarToggleService } from '../../../core/services/sidebar-toggle/sidebar-toggle.service';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { LoginService } from '../../../core/services/login-service/login-service.service';
import { LogoutService } from '../../../core/services/logout-service/logout-service.service';
import { AddToCartService } from '../../../core/services/add-to-cart/add-to-cart.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { FormsModule } from '@angular/forms';
import { DynamicSearchService } from '../../../core/services/dynamic-search/dynamic-search.service';
import { SearchComponent } from '../../../modules/search/search.component';
import { FetchChildService } from '../../../core/services/fetch-child/fetch-child.service';
import { FetchMakeService } from '../../../core/services/fetch-make/fetch-make.service';
import { FetchYearService } from '../../../core/services/fetch-year/fetch-year.service';
import { VehicleSearchService } from '../../../core/services/search-vehicle/search-vehicle.service';
import { MainCategoryService } from '../../../core/services/main-category/main-category.service';
import { SubCategoryService } from '../../../core/services/sub-category/sub-category.service';
import { CategoryIdService } from '../../../core/services/category-id/category-id.service';
import { B2cSearchComponent } from '../../modules/b2c/b2c-search/b2c-search.component';
import { SearchQueryService } from '../../../core/services/search-query/search-query.service';


@Component({
  selector: 'app-b2c-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './b2c-navbar.component.html',
  styleUrl: './b2c-navbar.component.css'
})
export class B2cNavbarComponent {

   showSearchBar = true; // Initially, show the search bar
    isSliderVisible: boolean = false;
    isSidebarVisible = false;
    categories$: Observable<any[]> | undefined;
    products$: Observable<any[]> | undefined; // For trending items
    searchProducts$: Observable<any[]> = of([]); // Initialize as empty array observable
    showingSearchResults: boolean = false; // Flag to toggle between trending and search results
    // showSearchComponent: boolean = false; 
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
    isBrowser: boolean = false;

     constructor(
        private apiService: ApiService,
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
        private router: Router,
        private route: ActivatedRoute,
        private categoryIdService: CategoryIdService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private sidebarToggleService: SidebarToggleService,
        private searchQueryService: SearchQueryService,
      ) {}

      ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
          if (params['query']) {
            const queryFromUrl = params['query'];
            this.searchQuery = queryFromUrl;
            
            // Update the service (only need to do this in one component)
            this.searchQueryService.setQuery(queryFromUrl);
            
            // Update the input field directly if needed
            const searchInput = document.getElementById('search-input') as HTMLInputElement;
            if (searchInput) {
              searchInput.value = queryFromUrl;
            }
          }
        });
        
        // Subscribe to the search query service
        this.searchQueryService.query$.subscribe(query => {
          this.searchQuery = query;
          // Update the input field when the query changes
          const searchInput = document.getElementById('search-input') as HTMLInputElement;
          if (searchInput) {
            searchInput.value = query;
          }
        });
      }

   onSearch(page: number = 1): void {
    debugger;
      this.currentSearchType = 'generalSearch';
      const searchInputElement = document.getElementById(
        'search-input'
      ) as HTMLInputElement;
      const newSearchQuery = searchInputElement
        ? searchInputElement.value.trim()
        : '';
  
      // Initialize loading states
      this.isPaginationLoading = page !== 1; // Only show pagination loading for pages other than 1
      this.isLoading = page === 1; // Show main loading spinner only on the first page
  
      // Update search query if it has changed
      if (newSearchQuery !== this.searchQuery) {
        this.searchQuery = newSearchQuery;
        this.searchQueryService.setQuery(this.searchQuery);
      }
  
      // this.showSearchComponent = true;
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
  
      // Update query params if there's a search query
     
        this.router.navigate(['/B2C/search'], {
          queryParams: { query: this.searchQuery },
        });
      
  
      this.dynamicSearchService
        .searchProducts(requestData)
        .pipe(
          map((response: any) => response || []),
          catchError((error) => {
            console.error('Error fetching products:', error);
            this.isLoading = false;
            this.isPaginationLoading = false;
            return of({ products: [], totalPages: 1 });
          })
        )
        .subscribe((products: any) => {
          // Update results and pagination data
          this.searchProducts$ = of(products.products || []);
          this.totalPages = products.totalPages || 1;
          this.currentPage = page;
  
          // Reset loading states
          this.isLoading = false;
          this.isPaginationLoading = false;
          this.cdr.detectChanges(); // Ensure the UI is updated
        });
    }

    openSidebar(): void {
      this.sidebarToggleService.toggleSidebar();
    }
}
