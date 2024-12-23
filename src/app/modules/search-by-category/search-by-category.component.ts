import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { NavigationService } from '../../core/services/navigation-service/navigation-service.service';
import { ActivatedRoute } from '@angular/router';
import { DynamicSearchService } from '../../core/services/dynamic-search/dynamic-search.service';
import { FetchChildService } from '../../core/services/fetch-child/fetch-child.service';
import { MainCategoryService } from '../../core/services/main-category/main-category.service';
import { SubCategoryService } from '../../core/services/sub-category/sub-category.service';
import { Router } from '@angular/router';
import { CategoryIdService } from '../../core/services/category-id/category-id.service';
import { HierarchyProductsService } from '../../core/services/hierarchy-products/hierarchy-products.service';
import { FilterSearchService } from '../../core/services/filter-search/filter-search.service';

@Component({
  selector: 'app-search-by-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './search-by-category.component.html',
  styleUrl: './search-by-category.component.css'
})
export class SearchByCategoryComponent {

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

  mainCategories: any[] = [];
  firstSubCategories: any[] = [];
  secondSubCategories: any[] = [];
  selectedMainCategory: string | null = null;
  selectedFirstSubCategory: string | null = null;
  selectedSecondSubCategory: string | null = null;

  m_id: number | null = null;
  f_id: number | null = null;
  s_id: number | null = null;
  products: any[] = [];
  pageSize: number = 10;
  
  lastCategoryData: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private navigationService: NavigationService,
    private activatedRoute: ActivatedRoute,
    private dynamicSearchService: DynamicSearchService,
    private fetchChildService: FetchChildService,
    private mainCategoryService: MainCategoryService,
    private subCategoryService: SubCategoryService,
    private router: Router,
    private categoryIdService: CategoryIdService,
    private hierarchyProductsService: HierarchyProductsService,
    private filterSearchService: FilterSearchService
  ) { }

  ngOnInit(): void {
    const categoryId = this.categoryIdService.getCategoryId();
    this.getMainCategories();
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
        }});
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
        const categoryData = {
          mainCategory: params['mainCategory'],
          firstSubCategory: params['firstSubCategory'],
          secondSubCategory: params['secondSubCategory']
        };
        this.currentSearchState = {
          type: 'categorySearch',
          data: categoryData
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
          engine: params['engine']
        };
        this.currentSearchState = {
          type: 'vehicleSearch',
          data: vehicleData
        };
        this.searchType = 'vehicleSearch';
      }
    });
  }
  
  private currentSearchState: {
    type: 'generalSearch' | 'vehicleSearch' | 'categorySearch' | 'filterCategorySearch' | null;
    data: any;
  } = {
    type: null,
    data: null
  };

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    // Set loading flags for pagination
    this.isPaginationLoading = true;
    this.isLocallyLoading = true;

    this.currentPage = page;
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

  getMainCategories(): void {
    this.searchType = 'categorySearch';
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

  performCategorySearch(categoryData: any): void {
    // Clear brand ID if the search type changes or new category data is provided
  if (
    this.searchType !== 'categorySearch' ||
    JSON.stringify(this.lastCategoryData) !== JSON.stringify(categoryData)
  ) {
    this.filterSearchService.clearSelectedBrand();
  }
    this.lastCategoryData = categoryData;
    let selectedBrandId: number | null = null;
    this.filterSearchService.selectedBrand$.subscribe((brandId) => {
      selectedBrandId = brandId;
    });
    // Initialize `currentRequestData` with full request structure
    this.searchType = 'categorySearch';
    this.currentSearchState.type = 'categorySearch';
    // this.currentSearchState.data = categoryData;

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
    this.router.navigate(['/B2B/search'], { queryParams: 
      {
        mainCategory: categoryData.mainCategory,
        firstSubCategory: categoryData.firstSubCategory,
        secondSubCategory: categoryData.secondSubCategory
      },
    });

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
      }
    );
  }

  searchByCategory(page: number): void {
    console.log('searchByCategory called with page:', page);
    this.currentPage = page;
    this.emitPageChange(page); // Call `emitPageChange` to handle pagination
  }
}
 