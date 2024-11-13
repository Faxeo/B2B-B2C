import {
  ChangeDetectorRef,
  Component,
  HostListener,
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
import { Router, RouterModule } from '@angular/router';
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
import { CategoryIdService } from '../../core/services/category-id/category-id.service';
import { response } from 'express';
import { ChatBotComponent } from '../chat-bot/chat-bot.component';

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
    ChatBotComponent
  ],
  providers: [ApiService, SidebarToggleService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  categories$: Observable<any[]> | undefined;
  products$: Observable<any[]> | undefined;
  searchProducts$: Observable<any[]> = of([]);
  showingSearchResults: boolean = false;
  showSearchComponent: boolean = false;
  loginType: string | null = null;
  isAdminSidebarVisible: boolean = false;
  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;
  searchInput$ = new BehaviorSubject<string>('');
  searchQuery: string = '';
  cartItemCount: number = 0;
  isLoading: boolean = false;
  isPaginationLoading: boolean = false;
  totalPages: number = 0;
  currentPage: number = 1;
  searchEnabled: boolean = false; 
  searchPlaceholder: string = '';
  showVehicleForm: boolean = false;
  selectedYear: string = '';
  selectedMake: string = '';
  selectedModel: string = '';
  selectedTrim: string = '';
  selectedEngine: string = '';
  years: { year: string }[] = [];
  makes: { name: string; cvalue_id: number }[] = [];
  models: { name: string; cvalue_id: number }[] = [];
  trims: { name: string; cvalue_id: number }[] = [];
  engines: { name: string }[] = [];
  currentSearchType:
    | 'generalSearch'
    | 'vehicleSearch'
    | 'categorySearch'
    | null = null;
  hasSearched: boolean = false;
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
    private vehicleSearchService: VehicleSearchService,
    private mainCategoryService: MainCategoryService,
    private subCategoryService: SubCategoryService,
    private router: Router,
    private categoryIdService: CategoryIdService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.getMainCategories();
    this.getYears();
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

    this.categories$ = this.apiService.getMainCategory().pipe(
      map((categories) =>
        categories.map((category: { name: string }) => ({
          ...category,
          image: `assets/car-parts-&-accessories.png`,
        }))
      )
    );

    this.products$ = this.apiService.getProducts().pipe(
      map((products) =>
        products.map((product: { product_image: string }) => ({
          ...product,
          image: `${product.product_image}`,
          product_quantity: 1,
        }))
      )
    );

    this.cartService.cartItemCount$.subscribe((count) => {
      this.cartItemCount = count;
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedInside = (event.target as HTMLElement).closest(
      '.admin-sidebar-options'
    );
    if (!clickedInside) {
      this.isAdminSidebarVisible = false;
    }
  }

  viewProductDetails(productId: number): void {
    if (productId) {
      this.router.navigate(['/product-details', productId]);
    } else {
      console.error('Product ID is undefined');
    }
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

  displaySearchBar(option: string): void {
    if (option === 'Category') {
      this.showCategoryForm = true;
      this.showVehicleForm = false;
      this.getMainCategories();
    } else if (option === 'Vehicle') {
      this.showVehicleForm = true;
      this.showCategoryForm = false;
    } else {
      this.showCategoryForm = false;
      this.showVehicleForm = false;
    }
    this.cdr.detectChanges();
  }

  searchByCategory(page: number = 1): void {
    this.currentSearchType = 'categorySearch';

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
      skip: (page - 1) * 10,
      take: 10,
      m_id: this.selectedMainCategory
        ? Number(this.selectedMainCategory)
        : null,
      f_id: this.selectedFirstSubCategory
        ? Number(this.selectedFirstSubCategory)
        : null,
      s_id: this.selectedSecondSubCategory
        ? Number(this.selectedSecondSubCategory)
        : null,
      page: page,
    };

    if (
      this.selectedMainCategory ||
      this.selectedFirstSubCategory ||
      this.selectedSecondSubCategory
    ) {
      this.router.navigate(['/search'], {
        queryParams: {
          mainCategory: this.selectedMainCategory || '',
          firstSubCategory: this.selectedFirstSubCategory || '',
          secondSubCategory: this.selectedSecondSubCategory || '',
        },
      });
    }

    this.dynamicSearchService.searchProducts(requestData).subscribe(
      (data: any) => {
        this.searchProducts$ = of(data.products || []);
        this.showCategoryForm = false;
        this.showSearchComponent = true;
        this.totalPages = data.totalPages || 1;
        this.currentPage = page;

        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Category Search Error:', error);

        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  updateVehicleSelection(vehicle: any): void {
    this.vehicleSearchService.setVehicleData(vehicle);
  }

  onSearchOptionClick(option: string): void {
    this.searchEnabled = true;
    this.searchPlaceholder = `Search By ${option}`;
  }

  onSearchClick(): void {
    if (this.searchPlaceholder === 'Search By Vehicle') {
      this.showVehicleForm = true;
    } else if (this.searchPlaceholder === 'Search By Category') {
      this.showCategoryForm = true;
    }
  }

  closeVehicleForm(): void {
    this.showVehicleForm = false;
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

  searchByVehicle(page: number = 1): void {
    this.currentSearchType = 'vehicleSearch';
    const vehicleData = this.vehicleSearchService.getVehicleData();
    const searchInputElement = document.getElementById(
      'search-input'
    ) as HTMLInputElement;
    const newSearchQuery = searchInputElement
      ? searchInputElement.value.trim()
      : '';

    if (!this.showSearchComponent || newSearchQuery !== this.searchQuery) {
      this.isLoading = true;
      this.isPaginationLoading = false;
      this.searchQuery = newSearchQuery;
    } else {
      this.isLoading = false;
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
      page: page,
    };

    if (
      vehicleData.year &&
      vehicleData.make &&
      vehicleData.model &&
      vehicleData.trim &&
      vehicleData.engine
    ) {
      this.router.navigate(['/search'], {
        queryParams: {
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          trim: vehicleData.trim,
          engine: vehicleData.engine,
        },
      });
    }

    this.dynamicSearchService.searchProducts(requestData).subscribe(
      (data: any) => {
        this.searchProducts$ = of(data.products || []);
        this.showVehicleForm = false;
        this.showSearchComponent = true;
        this.totalPages = data.totalPages || 1;
        this.currentPage = page;

        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Vehicle Search Error:', error);
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  onSearch(page: number = 1): void {
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

    // Update query params if there's a search query
    if (this.searchQuery) {
      this.router.navigate(['/search'], {
        queryParams: { query: this.searchQuery },
      });
    }

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

  onPageChange(page: number): void {
    this.currentPage = page; // Update currentPage in HomeComponent
    if (this.currentSearchType === 'generalSearch') {
      this.onSearch(page); // Perform general search with the new page
    } else if (this.currentSearchType === 'vehicleSearch') {
      this.searchByVehicle(page); // Perform vehicle search with the new page
    } else if (this.currentSearchType === 'categorySearch') {
      this.searchByCategory(page); // Perform category search with the new page
    }
  }

  get displayedProducts$(): Observable<any[]> {
    return this.showingSearchResults ? this.searchProducts$! : this.products$!;
  }

  openSidebar(): void {
    this.sidebarToggleService.toggleSidebar();
  }

  toggleAdminSidebar(event: Event) {
    event.stopPropagation();
    this.isAdminSidebarVisible = !this.isAdminSidebarVisible;
  }

  logout(): void {
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
          console.log('Item added to cart:', product);
          this.displayMessage('Item added to cart successfully!');
        },
        error: (error) => {
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
    this.showVehicleForm = false;
    this.showCategoryForm = false;
  }

  onCategoryClick(categoryId: number): void {
    console.log('Setting categoryId in service:', categoryId);

    // Set the categoryId in the service
    this.categoryIdService.setCategoryId(categoryId);

    // Navigate to the category route
    this.router.navigate(['/category']);
  }
}
