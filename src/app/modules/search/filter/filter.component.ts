import {
  ChangeDetectorRef,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { NavigationService } from '../../../core/services/navigation-service/navigation-service.service';
import { SubCategoryService } from '../../../core/services/sub-category/sub-category.service';
import { MainCategoryService } from '../../../core/services/main-category/main-category.service';
import { FetchChildService } from '../../../core/services/fetch-child/fetch-child.service';
import { DynamicSearchService } from '../../../core/services/dynamic-search/dynamic-search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterSearchService } from '../../../core/services/filter-search/filter-search.service';
import { CategoryNavbarSearchService } from '../../../core/services/category-navbar-search/category-navbar-search.service';
import { GetBrandsService } from '../../../core/services/get-brands/get-brands.service';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})

export class FilterComponent {
  mainCategories: any[] = [];
  firstSubCategories: any[] = [];
  secondSubCategories: any[] = [];
  selectedMainCategory: string | null = null;
  selectedFirstSubCategory: string | null = null;
  selectedSecondSubCategory: string | null = null;
  currentRequestData: any = {};
  currentPage: number = 1;
  isLocallyLoading: boolean = false;
  searchResults: any[] = [];
  totalPages: number = 1;
  showFilters: boolean = false;
  showCategories: boolean = false;
  showManufacturers: boolean = false;
  showPrices: boolean = false;
  showMaterials: boolean = false;
  brands: { id: number; name: string; selected: boolean }[] = [];
  selectedBrand: number | null = null;
  showBrands: boolean = false;
  selectedBrandName: string | null = null; // Holds the name of the selected brand


  constructor(
    private navigationService: NavigationService,
    private fetchChildService: FetchChildService,
    private mainCategoryService: MainCategoryService,
    private subCategoryService: SubCategoryService,
    private dynamicSearchService: DynamicSearchService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private filterSearchService: FilterSearchService,
    private categoryNavbarSearchService: CategoryNavbarSearchService,
    private getBrandsService: GetBrandsService,
  ) {}

  ngOnInit(): void {
    this.getMainCategories();
    this.getBrands();
  }

  getBrands(): void {
    this.getBrandsService.fetchBrands().subscribe(
      (data) => {
        this.brands = data; // Now includes `selected` property
      },
      (error) => {
        console.error('Error fetching brands:', error);
      }
    );
  }

  onBrandChange(brandId: number | null): void {
    if (brandId === null) {
      // Brand deselected
      console.log('Brand deselected, setting brandId to null');
      this.selectedBrand = null;
      this.filterSearchService.clearSelectedBrand(); // Clear the selected brand
    } else {
      // Brand selected
      console.log(`Selected brand ID: ${brandId}`);
      this.selectedBrand = brandId;
      this.filterSearchService.updateSelectedBrand(brandId); // Update the selected brand
    }
  }
   
  
  updateSelectedBrands(brandIds: number[]): void {
    console.log('Selected brands:', brandIds);
    this.filterSearchService.updateSelectedBrands(brandIds); // Pass the correct parameter
  }

  onBackClick(): void {
    this.navigationService.goBack();
  }

  onCategorySelectionChange(): void {
    const selectedData = {
      mainCategory: this.selectedMainCategory,
      firstSubCategory: this.selectedFirstSubCategory,
      secondSubCategory: this.selectedSecondSubCategory,
    };
    this.filterSearchService.updateSelectedCategories(
      Number(this.selectedMainCategory),
      Number(this.selectedFirstSubCategory),
      Number(this.selectedSecondSubCategory)
    );
  }

  toggleSection(section: string): void {
    switch (section) {
      case 'filters':
        this.showFilters = !this.showFilters;
        break;
      case 'categories':
        this.showCategories = !this.showCategories;
        break;
      case 'manufacturers':
        this.showManufacturers = !this.showManufacturers;
        break;
      case 'prices':
        this.showPrices = !this.showPrices;
        break;
      case 'materials':
        this.showMaterials = !this.showMaterials;
        break;
      case 'brands': // Add this case
        this.showBrands = !this.showBrands;
        break;
    }
  }

  getMainCategories(): void {
    this.mainCategoryService.getMainCategories().subscribe(
      (data: any[]) => {
        if (Array.isArray(data)) {
          this.mainCategories = data.map((category) => ({
            id: category.id,
            name: category.name,
            selected: false, // for checkbox tracking
            showSubCategories: false, // to toggle first subcategories visibility
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

  onMainCategoryChange(selectedCategory: any): void {
    // Deselect all other main categories
    this.mainCategories.forEach((category) => {
      if (category !== selectedCategory) {
        category.selected = false;
      }
    });

    // Update selectedMainCategory
    this.selectedMainCategory = selectedCategory.selected
      ? selectedCategory.id
      : null;

    this.categoryNavbarSearchService.setCategoryData(
      Number(this.selectedMainCategory),
      0,
      0
    );

    // Update the service with m_id, f_id as 0 (no subcategory selected yet), s_id as 0
    this.filterSearchService.updateSelectedCategories(
      Number(this.selectedMainCategory),
      0,
      0
    );

    // Fetch first subcategories for the selected main category
    this.subCategoryService
      .getSubCategories(1, Number(this.selectedMainCategory))
      .subscribe(
        (data: any[]) => {
          this.firstSubCategories = Array.isArray(data)
            ? data.map((subCategory) => ({
                id: subCategory.id,
                name: subCategory.name,
                selected: false,
              }))
            : [];
          this.selectedFirstSubCategory = '';
          this.secondSubCategories = [];
          this.selectedSecondSubCategory = '';
        },
        (error: any) => {
          console.error('Error fetching first sub-categories:', error);
        }
      );
  }

  onFirstSubCategoryChange(subCategory: any): void {
    // Reset selected second subcategory when first subcategory changes
    this.secondSubCategories.forEach(
      (secondSub) => (secondSub.selected = false)
    );
    this.selectedSecondSubCategory = null;

    // Update selectedFirstSubCategory
    this.selectedFirstSubCategory = subCategory.selected
      ? subCategory.id
      : null;

    // Save data to CategoryNavbarSearchService
    this.categoryNavbarSearchService.setCategoryData(
      Number(this.selectedMainCategory),
      Number(this.selectedFirstSubCategory),
      0
    );

    // Update the service with m_id, f_id, and s_id as 0 (no second subcategory selected yet)
    this.filterSearchService.updateSelectedCategories(
      Number(this.selectedMainCategory),
      Number(this.selectedFirstSubCategory),
      0
    );

    // Fetch second subcategories for the selected first subcategory
    if (this.selectedFirstSubCategory) {
      this.subCategoryService
        .getSubCategories(2, Number(this.selectedFirstSubCategory))
        .subscribe(
          (data: any[]) => {
            this.secondSubCategories = Array.isArray(data)
              ? data.map((subCategory) => ({
                  id: subCategory.id,
                  name: subCategory.name,
                  selected: false,
                }))
              : [];
          },
          (error: any) => {
            console.error('Error fetching second sub-categories:', error);
          }
        );
    }
  }

  onSecondSubCategoryChange(
    subCategory: any,
    selectedSecondSubCategory: any
  ): void {
    // Ensure only one second subcategory can be selected at a time
    if (selectedSecondSubCategory.selected) {
      subCategory.secondSubCategories.forEach(
        (secondSub: { id: number; selected: boolean }) => {
          if (secondSub !== selectedSecondSubCategory) {
            secondSub.selected = false;
          }
        }
      );
      this.selectedSecondSubCategory = selectedSecondSubCategory.id;
    } else {
      this.selectedSecondSubCategory = null;
    }

    // Save data to CategoryNavbarSearchService
    this.categoryNavbarSearchService.setCategoryData(
      Number(this.selectedMainCategory),
      Number(this.selectedFirstSubCategory),
      Number(this.selectedSecondSubCategory)
    );

    // Update the service with the selected m_id, f_id, and s_id
    this.filterSearchService.updateSelectedCategories(
      Number(this.selectedMainCategory),
      Number(this.selectedFirstSubCategory),
      Number(this.selectedSecondSubCategory)
    );
  }

  // Method to toggle and fetch first subcategories
  toggleSubCategories(category: any): void {
    category.showSubCategories = !category.showSubCategories;

    if (category.showSubCategories && !category.firstSubCategories) {
      // Fetch first subcategories if not already loaded
      this.subCategoryService.getSubCategories(1, category.id).subscribe(
        (data: any[]) => {
          category.firstSubCategories = Array.isArray(data)
            ? data.map((subCategory) => ({
                id: subCategory.id,
                name: subCategory.name,
                selected: false,
                showSecondSubCategories: false, // for toggling second subcategories
                secondSubCategories: null, // to store second subcategories
              }))
            : [];
        },
        (error) => {
          console.error('Error fetching first sub-categories:', error);
        }
      );
    }
  }

  // Method to toggle and fetch second subcategories
  toggleSecondSubCategories(subCategory: any): void {
    subCategory.showSecondSubCategories = !subCategory.showSecondSubCategories;

    if (
      subCategory.showSecondSubCategories &&
      !subCategory.secondSubCategories
    ) {
      // Fetch second subcategories if not already loaded
      this.subCategoryService.getSubCategories(2, subCategory.id).subscribe(
        (data: any[]) => {
          subCategory.secondSubCategories = Array.isArray(data)
            ? data.map((secondSubCategory) => ({
                id: secondSubCategory.id,
                name: secondSubCategory.name,
                selected: false,
              }))
            : [];
        },
        (error) => {
          console.error('Error fetching second sub-categories:', error);
        }
      );
    }
  }
}
