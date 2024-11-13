import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Inject, Input, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { SidebarToggleService } from '../../core/services/sidebar-toggle/sidebar-toggle.service';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { CartService } from '../../core/services/cart/cart.service';
import { LogoutService } from '../../core/services/logout-service/logout-service.service';
import { DynamicSearchService } from '../../core/services/dynamic-search/dynamic-search.service';
import { SidebarComponent } from '../sidebar/sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,FormsModule, SidebarComponent, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  @Input() loginType: string | null = null;
  @Input() cartItemCount: number = 0;
  isAdminSidebarVisible: boolean = false;
  currentSearchType:
  | 'generalSearch'
  | 'vehicleSearch'
  | 'categorySearch'
  | null = null;
  isPaginationLoading: boolean = false;
  isLoading: boolean = false;
  categories$: Observable<any[]> | undefined;
  products$: Observable<any[]> | undefined;
  searchProducts$: Observable<any[]> = of([]);
  showingSearchResults: boolean = false;
  showSearchComponent: boolean = false;
  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;
  searchInput$ = new BehaviorSubject<string>('');
  searchQuery: string = '';
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
    private router: Router,
    private apiService: ApiService,
    private sidebarToggleService: SidebarToggleService,
    private loginService: LoginService,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private logoutService: LogoutService,
    private dynamicSearchService: DynamicSearchService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  ngOnInit(): void {
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


  openSidebar(): void {
    this.sidebarToggleService.toggleSidebar();
  }

 
  toggleAdminSidebar(event: Event) {
    event.stopPropagation();
    this.isAdminSidebarVisible = !this.isAdminSidebarVisible;
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

  logout(): void {
    this.logoutService.logout();
  }
}
