import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterComponent } from './filter/filter.component';
import { CartSidebarComponent } from '../cart-sidebar/cart-sidebar.component';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { SearchResultsComponent } from "../search-results/search-results.component";
import { CartSidebarService } from '../../core/services/cart-sidebar/cart-sidebar.service';
import { FooterComponent } from '../../layout/footer/footer.component';


@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, FilterComponent, CartSidebarComponent, NavbarComponent, 
    SearchResultsComponent,
    //  FooterComponent
    ],
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})

export class SearchComponent implements OnInit {

  isLocallyLoading: boolean = false;
  isCollapsed: boolean = false;
  isCartSidebarCollapsed: boolean = false;
  isFilterCollapsed: boolean = false;
  isCartCollapsed: boolean = true; // For Cart Sidebar

  mobileFilterOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartSidebarService: CartSidebarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cartSidebarService.cartSidebarState$.subscribe((state) => {
      this.isCartCollapsed = state;
      this.cdr.detectChanges();
    });
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

   toggleMobileFilter(): void {
    this.mobileFilterOpen = !this.mobileFilterOpen;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  } 

  toggleFilterSidebar(): void {
    this.isFilterCollapsed = !this.isFilterCollapsed;
  }

 toggleCartSidebar(): void {
    if (this.isCartCollapsed) {
      this.openCartSidebar();
    } else {
      this.collapseCartSidebar();
    }
  }

  collapseCartSidebar(): void {
    this.cartSidebarService.closeCartSidebar(); // Trigger close
  }

  openCartSidebar(): void {
    this.cartSidebarService.openCartSidebar(); // Trigger open
  }
}
