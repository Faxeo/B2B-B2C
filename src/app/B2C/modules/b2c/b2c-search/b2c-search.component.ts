import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterComponent } from "../../../../modules/search/filter/filter.component";
import { B2cGeneralSearchComponent } from '../b2c-general-search/b2c-general-search.component';
import { B2cNavbarComponent } from '../../../layout/b2c-navbar/b2c-navbar.component';
import { B2cCartSidebarComponent } from "../b2c-cart-sidebar/b2c-cart-sidebar.component";

@Component({
  selector: 'app-b2c-search',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, FilterComponent, B2cGeneralSearchComponent, B2cNavbarComponent, B2cCartSidebarComponent],
  templateUrl: './b2c-search.component.html',
  styleUrls: ['./b2c-search.component.css'],
})

export class B2cSearchComponent implements OnInit {

  isLocallyLoading: boolean = false;
  isCollapsed: boolean = false;
  isCartSidebarCollapsed: boolean = false;
  isFilterCollapsed: boolean = false;
  isCartCollapsed: boolean = false; // For Cart Sidebar

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

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
    this.isCartCollapsed = true;
  }

  openCartSidebar(): void {
    this.isCartCollapsed = false;
  }
}
