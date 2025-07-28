import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
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
import { CategoryNavbarSearchService } from '../../core/services/category-navbar-search/category-navbar-search.service';
import { FilterSearchService } from '../../core/services/filter-search/filter-search.service';
import { SearchQueryService } from '../../core/services/search-query/search-query.service';
import { UserService } from '../../core/services/User/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
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
  hasSearched: boolean = false;
  showMainSearchBar: boolean = false;
  mainCategories: { id: number; name: string }[] = [];
  firstSubCategories: { id: number; name: string }[] = [];
  secondSubCategories: { id: number; name: string }[] = [];
  selectedMainCategory: string = '';
  selectedFirstSubCategory: string = '';
  selectedSecondSubCategory: string = '';
  showCategoryForm: boolean = false;
  searchResults: any[] = [];

  navbarSearchTerm = '';

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
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryNavbarSearchService: CategoryNavbarSearchService,
    private filterSearchService: FilterSearchService,
    private searchQueryService: SearchQueryService,
    public userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userID = localStorage.getItem('userID');
      this.loginService.getUserID().subscribe((userID) => {
        this.userID = userID;
        this.cartService.setUserDetails(this.userID, this.loginType);

        // Call fetchUserNameById and subscribe to the username observable
        if (this.userID) {
          this.userService.fetchUserNameById(this.userID, 'business'); // Assuming loginType 'business' for username
        }
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

    this.searchQueryService.query$.subscribe((term) => {
      this.navbarSearchTerm = term;
      this.cdr.markForCheck();
    });

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

    const { m_id, f_id, s_id } =
      this.categoryNavbarSearchService.getCategoryData();
    console.log('Saved Category Data:', { m_id, f_id, s_id });

    // Subscribe to the username observable from UserService
    this.userService.getUserNameObservable().subscribe((userName) => {
      if (userName) {
        console.log('NavbarComponent: Received userName from UserService:', userName);
      } else {
        console.log('NavbarComponent: userName is null or not yet available.');
      }
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

  onSearchClick(): void {
    this.filterSearchService.clearAllFilters();
    this.categoryNavbarSearchService.clearCategoryData();
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

    // Clear brand ID if the search type changes or a new query is performed
    if (
      this.currentSearchType !== 'generalSearch' ||
      this.searchQuery !== newSearchQuery
    ) {
      this.filterSearchService.clearSelectedBrand();
    }

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

    // Get m_id, f_id, and s_id from CategoryNavbarSearchService
    const { m_id, f_id, s_id } =
      this.categoryNavbarSearchService.getCategoryData();
    // Fetch the selected brand ID from FilterSearchService
    let selectedBrandId: number | null = null;
    this.filterSearchService.selectedBrand$.subscribe((brandId) => {
      selectedBrandId = brandId;
    });

    this.searchQueryService.setQuery(this.navbarSearchTerm);

    const requestData = {
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
      skip: skip,
      take: take,
      m_id: m_id ?? null, // Use m_id if available, otherwise null
      f_id: f_id ?? null, // Use f_id if available, otherwise null
      s_id: s_id ?? null, // Use s_id if available, otherwise null
      keyFeature: '',
      vendor: null,
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
    console.log('Request Data:', requestData);

    // Update query params if there's a search query
    if (this.searchQuery) {
      this.router.navigate(['/B2B/search'], {
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
        this.searchProducts$ = of(products.products || []);
        this.searchResults = products.products || [];
        // console.log('Search Results:', this.searchResults);
        this.totalPages = products.totalPages || 1;
        this.currentPage = page;
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.cdr.detectChanges();
      });
  }

  logout(): void {
    this.logoutService.logout();
  }
}