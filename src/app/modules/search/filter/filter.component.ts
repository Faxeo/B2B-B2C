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

  onCheckboxChange(brandId: number): void {
    // If the selected brand is the same, deselect it
    if (this.selectedBrand === brandId) {
      this.selectedBrand = null;
      this.filterSearchService.clearSelectedBrand();
      console.log('Brand deselected:', brandId);
    } else {
      // Deselect all brands and select the new one
      this.brands.forEach(brand => brand.selected = false);
      
      const selectedBrand = this.brands.find(brand => brand.id === brandId);
      if (selectedBrand) {
        selectedBrand.selected = true;
        this.selectedBrand = brandId;
        this.filterSearchService.updateSelectedBrand(brandId);
        console.log('Brand selected:', brandId);
      }
    }
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

  isAnySubCategorySelected(category: any): boolean {
    if (category.firstSubCategories) {
      return category.firstSubCategories.some((sub: any) => 
        sub.selected || 
        (sub.secondSubCategories && sub.secondSubCategories.some((secSub: any) => secSub.selected))
      );
    }
    return false;
  }
  
  updateCategorySelection(selectedCategory: any): void {
    // Update selection logic here if necessary
    console.log('Updating category selection:', selectedCategory);
  
    // Example: Update other parts of the component state if required
    this.onCategorySelectionChange();
  }

  // Disable firstSubCategories if any secondSubCategory is selected
isAnySecondSubCategorySelected(subCategory: any): boolean {
  if (subCategory.secondSubCategories) {
    return subCategory.secondSubCategories.some((secondSub: any) => secondSub.selected);
  }
  return false;
}

isAnyOtherFirstSubCategorySelected(currentSubCategory: any, category: any): boolean {
  if (!category.firstSubCategories) return false;
  
  return category.firstSubCategories.some((firstSub: any) => {
    if (firstSub === currentSubCategory) return false;
    
    // Check if this first subcategory is selected
    if (firstSub.selected) return true;
    
    // Check if any of its second subcategories are selected
    if (firstSub.secondSubCategories) {
      return firstSub.secondSubCategories.some((secondSub: any) => secondSub.selected);
    }
    
    return false;
  });
}

// Disable main categories if any subcategories or second subcategories are selected



onMainCategoryChange(selectedCategory: any): void {
  // Deselect all other main categories and their subcategories
  this.mainCategories.forEach((category) => {
    if (category !== selectedCategory) {
      category.selected = false;

      // Deselect all first and second subcategories of the unselected main category
      if (category.firstSubCategories) {
        category.firstSubCategories.forEach((sub: any) => {
          sub.selected = false;
          if (sub.secondSubCategories) {
            sub.secondSubCategories.forEach((secSub: any) => secSub.selected = false);
          }
        });
      }
    }
  });

  // Update selectedMainCategory
  this.selectedMainCategory = selectedCategory.selected ? selectedCategory.id : null;

  this.categoryNavbarSearchService.setCategoryData(
    Number(this.selectedMainCategory),
    0,
    0
  );

  // Update the service with main category, and reset subcategory selections
  this.filterSearchService.updateSelectedCategories(
    Number(this.selectedMainCategory),
    0,
    0
  );

  // Reset first subcategories if the main category is unchecked
  if (!selectedCategory.selected && selectedCategory.firstSubCategories) {
    selectedCategory.firstSubCategories.forEach((sub: any) => {
      sub.selected = false;
      if (sub.secondSubCategories) {
        sub.secondSubCategories.forEach((secSub: any) => secSub.selected = false);
      }
    });
  }

  this.updateCategorySelection(selectedCategory);

  // Fetch first subcategories for the selected main category
  if (this.selectedMainCategory) {
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
        },
        (error: any) => {
          console.error('Error fetching first sub-categories:', error);
        }
      );
  }
}



onFirstSubCategoryChange(subCategory: any): void {
  // Find the parent main category
  const parentCategory = this.mainCategories.find(category => 
    category.firstSubCategories?.some((sub: any) => sub === subCategory)
  );

  if (!parentCategory) return;

  // Deselect all other first subcategories of the same main category
  parentCategory.firstSubCategories.forEach((firstSub: any) => {
    if (firstSub !== subCategory) {
      firstSub.selected = false;

      // Deselect all second subcategories if the parent first subcategory is deselected
      if (firstSub.secondSubCategories) {
        firstSub.secondSubCategories.forEach((secSub: any) => secSub.selected = false);
      }
    }
  });

  // Clear second subcategories when switching first subcategories
  if (!subCategory.selected) {
    if (subCategory.secondSubCategories) {
      subCategory.secondSubCategories.forEach((secSub: any) => secSub.selected = false);
    }
    this.secondSubCategories = [];
    this.selectedSecondSubCategory = null;
  }

  // Update selectedFirstSubCategory
  this.selectedFirstSubCategory = subCategory.selected ? subCategory.id : null;

  // Update CategoryNavbarSearchService
  this.categoryNavbarSearchService.setCategoryData(
    Number(this.selectedMainCategory),
    Number(this.selectedFirstSubCategory),
    0
  );

  // Reset second subcategory selection
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



onSecondSubCategoryChange(subCategory: any, selectedSecondSubCategory: any): void {
  // Deselect other second subcategories of the same parent subcategory
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

  // Update CategoryNavbarSearchService
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
 