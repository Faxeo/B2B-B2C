import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { CartService } from '../../core/services/cart/cart.service';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { AddVehicleService } from '../../core/services/add-vehicle/add-vehicle.service';
import { VehicleSearchService } from '../../core/services/search-vehicle/search-vehicle.service';
import { FilterComponent } from './filter/filter.component';
import { NavigationService } from '../../core/services/navigation-service/navigation-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DynamicSearchService } from '../../core/services/dynamic-search/dynamic-search.service';
import { FetchYearService } from '../../core/services/fetch-year/fetch-year.service';
import { FetchMakeService } from '../../core/services/fetch-make/fetch-make.service';
import { FetchChildService } from '../../core/services/fetch-child/fetch-child.service';
import { MainCategoryService } from '../../core/services/main-category/main-category.service';
import { SubCategoryService } from '../../core/services/sub-category/sub-category.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { RecentlyViewedService } from '../../core/services/recently-viewed/recently-viewed.service';
import { RecentlyViewedComponent } from '../recently-viewed/recently-viewed.component';
import { FilterSearchService } from '../../core/services/filter-search/filter-search.service';
import { CategoryIdService } from '../../core/services/category-id/category-id.service';
import { HierarchyProductsService } from '../../core/services/hierarchy-products/hierarchy-products.service';
import { AddToWishlistService } from '../../core/services/add-to-wishlist/add-to-wishlist.service';
import { RemoveFromWishlistService } from '../../core/services/remove-from-wishlist/remove-from-wishlist.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { SearchByVehicleComponent } from '../search-by-vehicle/search-by-vehicle.component';
import { CategoryNavbarSearchService } from '../../core/services/category-navbar-search/category-navbar-search.service';
import { CartSidebarComponent } from '../cart-sidebar/cart-sidebar.component';
import { SearchByCategoryComponent } from '../search-by-category/search-by-category.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterComponent,
    NavbarComponent,
    RecentlyViewedComponent,
    RouterModule,
    SearchByVehicleComponent,
    SearchByCategoryComponent,
    // CartSidebarComponent,
  ],
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnChanges {
  @Input() searchResults: any[] = [];
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() isLoading: boolean = false;
  @Input() isPaginationLoading: boolean = false;
  @Input() searchType:
    | 'generalSearch'
    | 'vehicleSearch'
    | 'categorySearch'
    | 'filterCategorySearch'
    | null = null;
  @Input() loginType: string | null = null;

  @Output() pageChange = new EventEmitter<number>();
  @Output() vehicleSearchPageChange = new EventEmitter<number>();
  @Output() categorySearchPageChange = new EventEmitter<number>();

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
  vehicleData: any = {}; // Define structure based on the actual vehicle data requirements
  categoryData: any = {}; // Define structure based on the actual category data requirements
  currentRequestData: any = {};

  years: any[] = [];
  makes: any[] = [];
  models: any[] = [];
  trims: any[] = [];
  engines: any[] = [];
  mainCategories: any[] = [];
  firstSubCategories: any[] = [];
  secondSubCategories: any[] = [];

  selectedYear: string | null = null;
  selectedMake: string | null = null;
  selectedModel: string | null = null;
  selectedTrim: string | null = null;
  selectedEngine: string | null = null;
  selectedMainCategory: string | null = null;
  selectedFirstSubCategory: string | null = null;
  selectedSecondSubCategory: string | null = null;
  showRecentlyViewed: boolean = false;

  m_id: number | null = null;
  f_id: number | null = null;
  s_id: number | null = null;
  products: any[] = [];
  pageSize: number = 10;

  wishlist: number[] = []; // Array to store product IDs in the wishlist
  businessId: number = 123; // Replace with your actual business ID
  lastQuery: string = '';
  lastCategoryData: string = '';
  lastVehicleData: string = '';

  activeSearchType: 'general' | 'category' | 'vehicle' = 'general'; // Default to 'general'


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private loginService: LoginService,
    private addVehicleService: AddVehicleService,
    private vehicleSearchService: VehicleSearchService,
    private navigationService: NavigationService,
    private activatedRoute: ActivatedRoute,
    private dynamicSearchService: DynamicSearchService,
    private fetchYearService: FetchYearService,
    private fetchMakeService: FetchMakeService,
    private fetchChildService: FetchChildService,
    private mainCategoryService: MainCategoryService,
    private subCategoryService: SubCategoryService,
    private recentlyViewedService: RecentlyViewedService,
    private router: Router,
    private filterSearchService: FilterSearchService,
    private categoryIdService: CategoryIdService,
    private hierarchyProductsService: HierarchyProductsService,
    private addToWishlistService: AddToWishlistService,
    private removeFromWishlistService: RemoveFromWishlistService,
    private wishlistService: WishlistService,
    private categoryNavbarSearchService: CategoryNavbarSearchService
  ) {
    this.filterSearchService.selectedCategories$.subscribe((categories) => {
      this.m_id = categories.m_id;
      this.f_id = categories.f_id;
      this.s_id = categories.s_id;
      // Fetch products based on updated filter values, starting from page 1
      this.fetchProducts(this.m_id ?? 0, this.f_id ?? 0, this.s_id ?? 0, 1);
    });
    this.filterSearchService.selectedCategories$.subscribe((categories) => {
      this.currentSearchState = {
        type: 'filterCategorySearch',
        data: categories,
      };

      this.m_id = categories.m_id;
      this.f_id = categories.f_id;
      this.s_id = categories.s_id;

      // Reset the search results when filter changes
      this.searchResults = [];
      this.currentPage = 1;

      // Only fetch if we have valid category ID
      if (this.m_id) {
        this.fetchProducts(this.m_id, this.f_id ?? 0, this.s_id ?? 0, 1);
      }
    });
  }

  ngOnInit(): void {
    this.getYears();
    const categoryId = this.categoryIdService.getCategoryId();
    this.filterSearchService.selectedBrand$.subscribe((brandId) => {
      if (brandId !== null) {
        if (this.activeSearchType === 'general') {
          this.performGeneralSearch(this.lastQuery || '');
        } else if (this.activeSearchType === 'category') {
          this.performCategorySearch(this.lastCategoryData || '');
        } else if (this.activeSearchType === 'vehicle') {
          this.performVehicleSearch(this.lastVehicleData || '');
        }
      } 
    });
    this.getMainCategories();
    this.recentlyViewedService.recentlyViewed$.subscribe((products) => {
      this.showRecentlyViewed = products.length > 0;
    });
    if (isPlatformBrowser(this.platformId)) {
      this.userID = localStorage.getItem('userID');
      this.loginService.getUserID().subscribe((userID) => {
        this.userID = userID;
        this.cartService.setUserDetails(this.userID, this.loginType);
      });

      this.loginService.getLoginType().subscribe((loginType) => {
        this.loginType = loginType;
        if (this.loginType === 'business') {
          const username = localStorage.getItem('username');
          this.loginType = username || this.loginType;
        }
        this.cartService.setUserDetails(this.userID, this.loginType);
      });
    }

    this.cartService.cartItemCount$.subscribe((count) => {
      this.cartItemCount = count;
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      // Reset search results when params change
      this.searchResults = [];
      this.currentPage = 1;

      if (params['query']) {
        this.currentSearchState = {
          type: 'generalSearch',
          data: params['query'],
        };
        this.searchType = 'generalSearch';
        this.performGeneralSearch(params['query']);
      } else if (
        params['mainCategory'] ||
        params['firstSubCategory'] ||
        params['secondSubCategory']
      ) {
        const categoryData = {
          mainCategory: params['mainCategory'],
          firstSubCategory: params['firstSubCategory'],
          secondSubCategory: params['secondSubCategory'],
        };
        this.currentSearchState = {
          type: 'categorySearch',
          data: categoryData,
        };
        this.searchType = 'categorySearch';
        this.performCategorySearch(categoryData);
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
        this.currentSearchState = {
          type: 'vehicleSearch',
          data: vehicleData,
        };
        this.searchType = 'vehicleSearch';
        this.performVehicleSearch(vehicleData);
      }
    });
    this.loadWishlist();
    const { m_id, f_id, s_id } =
      this.categoryNavbarSearchService.getCategoryData();
    console.log('Saved Category Data:', { m_id, f_id, s_id });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (isPlatformBrowser(this.platformId)) {
      if (changes['isLoading'] || changes['isPaginationLoading']) {
        const isLoadingNow =
          changes['isLoading']?.currentValue === true ||
          changes['isPaginationLoading']?.currentValue === true;

        this.isLocallyLoading = isLoadingNow;
        this.cdr.detectChanges();
      }

      if (changes['searchResults'] && changes['searchResults'].currentValue) {
        this.isLocallyLoading = false;
        this.cdr.detectChanges();
      }
    }
  }

  // Fetch wishlist details
  loadWishlist(): void {
    if (!this.userID) return;

    this.wishlistService
      .getWishlistDetailsByBusinessId(this.businessId)
      .subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            const wishlistIds = response.map((item: any) => item.productId);
            this.markWishlistProducts(wishlistIds);
          }
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
        },
      });
  }

  markWishlistProducts(wishlistIds: number[]): void {
    this.products = this.products.map((product) => ({
      ...product,
      isInWishlist: wishlistIds.includes(product.product_id),
    }));
  }

  toggleWishlist(product: any): void {
    if (!this.userID) {
      alert('Please log in to manage your wishlist.');
      return;
    }

    if (product.isInWishlist) {
      this.removeFromWishlist(product);
    } else {
      this.addToWishlist(product);
    }
  }

  addToWishlist(product: any): void {
    if (!this.userID) {
      this.displayNotification('Please log in to add items to wishlist.');
      return;
    }

    this.addToWishlistService
      .addToWishlist(
        product.product_id,
        this.userID,
        Number(this.userID) // Convert to number for businessId
      )
      .subscribe({
        next: () => {
          product.isInWishlist = true;
          this.displayNotification('Product added to wishlist successfully!');
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.displayNotification(
            'Error adding item to wishlist: ' + error.message
          );
        },
      });
  }

  removeFromWishlist(product: any): void {
    if (!this.userID) {
      this.displayNotification('Please log in to remove items from wishlist.');
      return;
    }

    this.removeFromWishlistService
      .removeFromWishlist(
        Number(this.userID),
        Number(this.userID), // Convert to number for businessId
        product.product_id
      )
      .subscribe({
        next: () => {
          product.isInWishlist = false;
          this.displayNotification(
            'Product removed from wishlist successfully!'
          );
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          this.displayNotification(
            'Error removing item from wishlist: ' + error.message
          );
        },
      });
  }

  private currentSearchState: {
    type:
      | 'generalSearch'
      | 'vehicleSearch'
      | 'categorySearch'
      | 'filterCategorySearch'
      | null;
    data: any;
  } = {
    type: null,
    data: null,
  };

  fetchProducts(m_id: number, f_id: number, s_id: number, page: number): void {
    if (!m_id) {
      console.log('Invalid m_id: No products to fetch');
      this.products = [];
      this.isLoading = false;
      this.isLocallyLoading = false;
      this.isPaginationLoading = false;
      return;
    }

    this.searchType = 'filterCategorySearch';
    const take = this.pageSize;
    const requestData = { m_id, f_id, s_id, page, pageSize: take };

    console.log('Request Data for Category API:', requestData);

    // Set loading state BEFORE making the API call
    this.isLocallyLoading = true;

    this.hierarchyProductsService.getHierarchyProducts(requestData).subscribe(
      (response) => {
        if (response.products && response.products.length > 0) {
          this.products = response.products;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
        } else {
          this.products = [];
          console.log('No products found for this category.');
        }

        // Reset loading state after successful response
        this.isLocallyLoading = false;
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.products = [];
        // Reset loading state on error
        this.isLocallyLoading = false;
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    // Set loading flags for pagination
    this.isPaginationLoading = true;
    this.isLocallyLoading = true;

    this.currentPage = page;
    this.fetchProducts(
      this.m_id ?? 0,
      this.f_id ?? 0,
      this.s_id ?? 0,
      this.currentPage
    );
  }

  viewProductDetails(productId: number): void {
    if (productId) {
      this.router.navigate(['/product-details', productId]);
    } else {
      console.error('Product ID is undefined');
    }
  }

  addToRecentlyViewed(product: any): void {
    // console.log('Adding to recently viewed:', product);
    this.recentlyViewedService.addProductToRecentlyViewed(product);
  }

  closeRecentlyViewed(): void {
    this.showRecentlyViewed = false;
  }

  emitPageChange(page: number): void {
    console.log(
      `emitPageChange called with page: ${page} and searchType: ${this.searchType}`
    );
    this.currentPage = page;
    this.isLocallyLoading = true;

    // Update skip and page for pagination
    this.currentRequestData.skip = (this.currentPage - 1) * 10;
    this.currentRequestData.page = this.currentPage;

    this.dynamicSearchService.searchProducts(this.currentRequestData).subscribe(
      (response: any) => {
        this.searchResults = response.products || [];
        this.totalPages = response.totalPages || 1;
        this.isLocallyLoading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error(
          `Error fetching products for ${this.searchType} pagination:`,
          error
        );
        this.isLocallyLoading = false;
      }
    );
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

  getMainCategories(): void {
    this.mainCategoryService.getMainCategories().subscribe(
      (data: any[]) => {
        if (Array.isArray(data)) {
          this.mainCategories = data.map((category) => ({
            id: category.id,
            name: category.name,
          }));
        } else {
          this.mainCategories = [];
        }
      },
      (error: any) => {
        console.error('Error fetching main categories:', error);
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
          this.models = data.map((item) => ({
            name: item.value_name,
            cvalue_id: item.cvalue_id,
          }));
          this.updateVehicleSelection({ make: this.selectedMake });
          this.selectedModel = '';
          this.trims = [];
          this.engines = [];
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

  onMainCategoryChange(): void {
    if (this.selectedMainCategory) {
      this.subCategoryService
        .getSubCategories(1, Number(this.selectedMainCategory))
        .subscribe(
          (data: any[]) => {
            if (Array.isArray(data)) {
              this.firstSubCategories = data.map((subCategory) => ({
                id: subCategory.id,
                name: subCategory.name,
              }));
            } else {
              this.firstSubCategories = [];
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

  onFirstSubCategoryChange(): void {
    if (this.selectedFirstSubCategory) {
      this.subCategoryService
        .getSubCategories(2, Number(this.selectedFirstSubCategory))
        .subscribe(
          (data: any[]) => {
            if (Array.isArray(data)) {
              this.secondSubCategories = data.map((subCategory) => ({
                id: subCategory.id,
                name: subCategory.name,
              }));
            } else {
              this.secondSubCategories = [];
            }
            this.selectedSecondSubCategory = '';
          },
          (error: any) => {
            console.error('Error fetching second sub-categories:', error);
          }
        );
    }
  }
  
  // Ensure that `performGeneralSearch` respects the current page setting
  performGeneralSearch(query: string): void {
    
    if (this.activeSearchType !== 'general' || this.lastQuery !== query) {
      this.filterSearchService.clearSelectedBrand();
    }

    this.lastQuery = query;
    this.activeSearchType = 'general';
    console.log('Performing general search with query:', query);
    // Get m_id, f_id, and s_id from CategoryNavbarSearchService
    const { m_id, f_id, s_id } =
      this.categoryNavbarSearchService.getCategoryData();

    let selectedBrandId: number | null = null;
    this.filterSearchService.selectedBrand$.subscribe((brandId) => {
      selectedBrandId = brandId;
    });

    this.currentRequestData = {
      // Store request data
      productName: '',
      manufacturer: '',
      compatibility: '',
      brand: selectedBrandId !== null ? `${selectedBrandId}` : '',
      description: '',
      upc: '',
      partNumber: '',
      attribute: '',
      includeCompatibility: false,
      includeManufacturer: false,
      includeAttribute: false,
      includeQuantity: false,
      includeImages: false,
      skip: (this.currentPage - 1) * 10,
      take: 10,
      m_id: m_id ?? null, // Use m_id if available, otherwise null
      f_id: f_id ?? null, // Use f_id if available, otherwise null
      s_id: s_id ?? null, // Use s_id if available, otherwise null
      keyFeature: '',
      vendor: null,
      search_description: query,
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
      page: this.currentPage,
    };
    this.isLocallyLoading = true;

    this.dynamicSearchService.searchProducts(this.currentRequestData).subscribe(
      (response: any) => {
        if (response && response.products) {
          this.searchResults = response.products;
          this.totalPages = response.totalPages || 1;
          this.isLocallyLoading = false;
          this.cdr.detectChanges();
        } else {
          console.error('Unexpected response format:', response);
          this.displayMessage('Unexpected response format from the server.');
        }
      },
      (error: any) => {
        console.error('Error performing general search:', error);
        this.isLocallyLoading = false;
        this.displayMessage('An error occurred while fetching search results.');
      }
    );
  }

  performCategorySearch(categoryData: any): void {
    if (this.activeSearchType !== 'category' || this.lastCategoryData !== categoryData) {
      this.filterSearchService.clearSelectedBrand();
    }
    this.activeSearchType = 'category';
    this.lastCategoryData = categoryData;
    let selectedBrandId: number | null = null;
    
    this.filterSearchService.selectedBrand$.subscribe((brandId) => {
      selectedBrandId = brandId;
    });
    // Initialize `currentRequestData` with full request structure
    this.searchResults = [];
    this.currentRequestData = {
      productName: '',
      manufacturer: '',
      compatibility: '',
      brand: selectedBrandId !== null ? `${selectedBrandId}` : '',
      description: '',
      upc: '',
      partNumber: '',
      attribute: '',
      includeCompatibility: false,
      includeManufacturer: false,
      includeAttribute: false,
      includeQuantity: false,
      includeImages: false,
      skip: (this.currentPage - 1) * 10,
      take: 10,
      m_id: categoryData.mainCategory || null,
      f_id: categoryData.firstSubCategory || null,
      s_id: categoryData.secondSubCategory || null,
      keyFeature: '',
      vendor: null,
      search_description: '',
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
      page: this.currentPage,
    };
    this.isLocallyLoading = true;

    console.log('Category search requestData:', this.currentRequestData);

    // Perform initial search request
    this.dynamicSearchService.searchProducts(this.currentRequestData).subscribe(
      (response: any) => {
        console.log('Category search response:', response);
        this.searchResults = response.products || [];
        this.totalPages = response.totalPages || 1;
        this.isLocallyLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error performing category search:', error);
        this.isLocallyLoading = false;
        this.displayMessage(
          'An error occurred while fetching search results. Please try again later.'
        );
      }
    );
  }

  searchByCategory(page: number): void {
    console.log('searchByCategory called with page:', page);
    this.currentPage = page;
    this.emitPageChange(page); // Call `emitPageChange` to handle pagination
  }

  performVehicleSearch(vehicleData: any): void {
    if (this.activeSearchType !== 'vehicle' || this.lastVehicleData !== vehicleData) {
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
      productName: '',
      manufacturer: '',
      compatibility: '',
      brand: selectedBrandId !== null ? `${selectedBrandId}` : '',
      description: '',
      upc: '',
      partNumber: '',
      attribute: '',
      includeCompatibility: false,
      includeManufacturer: false,
      includeAttribute: false,
      includeQuantity: false,
      includeImages: false,
      skip: (this.currentPage - 1) * 10,
      take: 10,
      m_id: null,
      f_id: null,
      s_id: null,
      keyFeature: '',
      vendor: null,
      search_description: '',
      compatiblityValues: {
        compatibilityID: 0,
        productID: 0,
        sno: null,
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        trim: vehicleData.trim,
        engine: vehicleData.engine,
        notes: '',
        isDeleted: null,
      },
      product_Attributes:
        "SELECT product_id FROM product_attributes_view WHERE concatenated_attributes LIKE '%%' order by product_id",
      attributeSearch: false,
      page: this.currentPage,
    };
    this.isLocallyLoading = true;
    console.log('Vehicle search requestData:', this.currentRequestData);

    // Initial vehicle search request
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

  // Call emitPageChange for pagination controls
  searchByVehicle(page: number): void {
    console.log('searchByVehicle called with page:', page);
    this.currentPage = page;
    this.emitPageChange(page); // Triggers pagination with currentRequestData
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  onBackClick(): void {
    this.navigationService.goBack();
  }

  getPagesToShow(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  shouldShowLeftEllipsis(): boolean {
    return this.currentPage > 3;
  }

  shouldShowRightEllipsis(): boolean {
    return this.currentPage < this.totalPages - 2;
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
    const userID = this.userID || '';
    const businessId = this.userID ? +this.userID : 0;
    const upc = product.product_identifier2;

    this.addToCartService
      .addToCart(
        product.product_id,
        userID,
        businessId,
        product.product_quantity
      )
      .subscribe({
        next: () => {
          this.cartService.addToCart({
            productId: product.product_id.toString(),
            name: product.product_name,
            price: product.product_price,
            image: product.product_image,
            quantity: product.product_quantity,
            upc: upc,
          });
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

  displayNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  displayAlert(alert: string): void {
    this.notificationAlert = alert;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

  addVehicle(product: any): void {
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
        if (response.statusCode === 409) {
          // Vehicle already exists in the garage
          this.displayAlert('Vehicle already exists in the garage.');
        } else {
          // Vehicle added successfully
          this.displayMessage(
            'Vehicle has been added to your garage successfully.'
          );
          console.log('Vehicle added successfully:', response);
        }
      },
      error: (error) => {
        this.displayNotification(
          'Failed to add the vehicle. Please try again later.'
        );
      },
    });
  }
}