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
import { fromEvent, Subject, Subscription } from 'rxjs';

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

  private resizeSubscription!: Subscription
  isLocallyLoading: boolean = false;
  isCollapsed: boolean = true;
  isCartSidebarCollapsed: boolean = false;
  isFilterCollapsed: boolean = false;
  isCartCollapsed: boolean = true; // For Cart Sidebar

  mobileFilterOpen = false;
  mobileCartOpen = false; // New property for mobile cart

  private readonly _largeScreenBreakpoint = 992;
    constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initial layout check
      this.checkScreenSize();

      // Subscribe to window resize event
      this.resizeSubscription = fromEvent(window, 'resize')
        .subscribe(() => this.checkScreenSize());
    }
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
  private checkScreenSize(): void {
      if (isPlatformBrowser(this.platformId)) {
        const isLargeScreen = window.innerWidth >= this._largeScreenBreakpoint;
  
        // On large screens, sidebars are always expanded.
        // On smaller (medium) screens, they are always collapsed by default.
        this.isCollapsed = !isLargeScreen;
        this.isCartCollapsed = !isLargeScreen;
  
        this.cdr.markForCheck(); // Notify Angular of the change
      }
    }

  toggleMobileFilter() {
    this.mobileFilterOpen = !this.mobileFilterOpen;
    
    // Optional: Prevent body scrolling when mobile filter is open
    if (this.mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // New method for mobile cart toggle
  toggleMobileCart() {
    this.mobileCartOpen = !this.mobileCartOpen;
    
    // Optional: Prevent body scrolling when mobile cart is open
    if (this.mobileCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  } 

  toggleFilterSidebar(): void {
    this.isFilterCollapsed = !this.isFilterCollapsed;
  }

  toggleCartSidebar(): void {
    this.isCartCollapsed = !this.isCartCollapsed;
  }

  collapseCartSidebar(): void {
    this.isCartCollapsed = true;
  }

  openCartSidebar(): void {
    this.isCartCollapsed = false;
  }
}