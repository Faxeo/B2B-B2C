import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterComponent } from '../search/filter/filter.component';
import { CartSidebarComponent } from '../cart-sidebar/cart-sidebar.component';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { SearchResultsComponent } from "../search-results/search-results.component";
import { CartSidebarService } from '../../core/services/cart-sidebar/cart-sidebar.service';
import { CategoryResultsComponent } from "../category-results/category-results.component";

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, FilterComponent, CartSidebarComponent, NavbarComponent, CategoryResultsComponent],
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit {

  isLocallyLoading: boolean = false;
  isCollapsed: boolean = false;
  isCartSidebarCollapsed: boolean = false;
  isFilterCollapsed: boolean = false;
  isCartCollapsed: boolean = false; // For Cart Sidebar

    mobileFilterOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartSidebarService: CartSidebarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cartSidebarService.cartSidebarState$.subscribe((state: boolean) => {
      this.isCartCollapsed = state; // Update the UI state
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
    this.isCartSidebarCollapsed = !this.isCartSidebarCollapsed;
  }

  collapseCartSidebar(): void {
    this.cartSidebarService.closeCartSidebar(); // Trigger close
  }

  openCartSidebar(): void {
    this.cartSidebarService.openCartSidebar(); // Trigger open
  }
}
