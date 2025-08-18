import {
  ChangeDetectorRef,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { NavigationService } from '../../../../shared/navigation-service/navigation-service.service';
import { SubCategoryService } from '../../../../features/search/services/sub-category/sub-category.service';
import { MainCategoryService } from '../../../../features/search/services//main-category/main-category.service';
import { FetchChildService } from '../../../../features/search/services//fetch-child/fetch-child.service';
import { DynamicSearchService } from '../../../../features/search/services//dynamic-search/dynamic-search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterSearchService } from '../../../../features/search/services//filter-search/filter-search.service';
import { CategoryNavbarSearchService } from '../../../../features/search/services//category-navbar-search/category-navbar-search.service';
import { GetBrandsService } from '../../../../features/search/services//get-brands/get-brands.service';
import { FetchMakeService } from '../../../../features/search/services//fetch-make/fetch-make.service';
import {
  YearMakeModelService,
  YearMakeModelResponse,
} from '../../../../features/garage/services/Year-Make-Model/year-make-model.service';

interface Vehicle {
  value_name: string; // the make
  showModels: boolean; // toggle for the nested list
  models: { value_name: string }[]; // just the model name
  selectedModel: string | null;
}

type MakeItem = YearMakeModelResponse['data']['makes'][number];

@Component({
    selector: 'app-filter',
    imports: [CommonModule, FormsModule],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.css'
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
  filteredBrands: { id: number; name: string; selected: boolean }[] = [];

  searchTerm: string = '';

  selectedBrandName: string | null = null; // Holds the name of the selected brand
  // Replace the old declarations with:
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  searchVehicleTerm: string = ''; // Search input
  selectedVehicle: string | null = null; // Selected vehicle

  selectedModel: string | null = null;

  isMobileFilterOpen = false;

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
    private fetchMakeService: FetchMakeService,
    private yearMakeModelService: YearMakeModelService
  ) {}

  ngOnInit(): void {
    this.getMainCategories();
    this.getBrands();
    this.fetchVehicles('2023');

    // Sync component state with service
    this.filterSearchService.selectedCategories$.subscribe((categories) => {
      this.selectedMainCategory =
        categories.m_id !== null ? categories.m_id.toString() : null;
      this.selectedFirstSubCategory =
        categories.f_id !== null ? categories.f_id.toString() : null;
      this.selectedSecondSubCategory =
        categories.s_id !== null ? categories.s_id.toString() : null;
    });

    this.filterSearchService.selectedBrand$.subscribe((brand) => {
      this.selectedBrand = brand;
    });

    this.filterSearchService.selectedMake$.subscribe((make) => {
      this.selectedVehicle = make;
    });

    this.filterSearchService.selectedBrand$.subscribe((brand) => {
      this.selectedBrand = brand;

      if (brand !== null && this.brands.length > 0) {
        const selected = this.brands.find((b) => b.id === brand);
        this.selectedBrandName = selected ? selected.name : null;
      }
    });

    this.filterSearchService.selectedModel$.subscribe(
      (model: string | null) => {
        console.log('FilterSearchService: Selected model updated to:', model);
      }
    );

    this.filterSearchService.selectedModel$.subscribe(
      (model: string | null) => {
        this.selectedModel = model;
        console.log('Selected model updated to:', model);
      }
    );

    // this.vehicles = fetchedData;
    this.filteredVehicles = [...this.vehicles];
  }

  openMobileFilter() {
    this.isMobileFilterOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeMobileFilter() {
    this.isMobileFilterOpen = false;
    document.body.style.overflow = 'auto'; // Re-enable background scrolling
  }

  applyMobileFilters() {
    // Apply your filter logic here
    this.closeMobileFilter();
  }

  resetFilters(): void {
    // Reset all main category checkboxes and their values
    this.mainCategories.forEach((category) => {
      category.selected = false;

      if (category.firstSubCategories) {
        category.firstSubCategories.forEach((subCategory: any) => {
          subCategory.selected = false;

          if (subCategory.secondSubCategories) {
            subCategory.secondSubCategories.forEach(
              (secondSubCategory: any) => (secondSubCategory.selected = false)
            );
          }
        });
      }
    });

    // Reset local component state
    this.selectedMainCategory = null;
    this.selectedFirstSubCategory = null;
    this.selectedSecondSubCategory = null;
    this.selectedVehicle = null;
    this.searchVehicleTerm = '';

    // Reset brands
    this.brands.forEach((brand) => {
      brand.selected = false;
    });
    this.selectedBrand = null;
    this.selectedBrandName = null;

    // Reset all services
    this.filterSearchService.clearAllFilters();
    this.categoryNavbarSearchService.clearCategoryData();
    this.filterSearchService.clearSelectedMake();

    this.selectedModel = null;
    this.filterSearchService.clearSelectedModel();

    // Manually trigger change detection
    this.cdr.detectChanges();

    // ① Clear every vehicle’s selectedModel and hide its models list
    this.vehicles.forEach((v) => {
      v.selectedModel = null;
      v.showModels = false;
      // (optional) v.models = [];
    });
    // ② Refresh filteredVehicles so the UI re-renders
    this.filteredVehicles = [...this.vehicles];

    // Manually trigger change detection
    this.cdr.detectChanges();
  }

  // filter.component.ts
  fetchVehicles(_year: string): void {
    this.yearMakeModelService.getHierarchy().subscribe(
      (resp: YearMakeModelResponse) => {
        if (!resp.success) {
          console.error('Hierarchy error:', resp.statusReason);
          return;
        }

        this.vehicles = resp.data.makes.map((m: MakeItem) => ({
          value_name: m.make,
          showModels: false,
          models: m.models.map((modelName: string) => ({
            value_name: modelName,
          })),
          selectedModel: null,
        }));

        this.filteredVehicles = [...this.vehicles];
      },
      (err) => {
        console.error('API error fetching hierarchy', err);
      }
    );
  }

  // toggleVehicleModels(vehicle: Vehicle): void {
  //   vehicle.showModels = !vehicle.showModels;
  // }

  // onVehicleModelChange(vehicle: Vehicle, modelName: string): void {
  //   // if you clicked the same make+model, clear everything
  //   if (
  //     this.selectedVehicle === vehicle.value_name &&
  //     this.selectedModel === modelName
  //   ) {
  //     console.log('Model deselected, clearing selection');
  //     this.clearAllSelections();
  //     return;
  //   }

  //   // otherwise clear old, then select this one
  //   this.clearAllSelections();

  //   this.selectedVehicle = vehicle.value_name;
  //   this.selectedModel = modelName;

  //   this.filterSearchService.updateSelectedMake(vehicle.value_name);
  //   this.filterSearchService.updateSelectedModel(modelName);

  //   console.log(
  //     `Model selected: ${modelName} for vehicle ${vehicle.value_name}`
  //   );
  // }

  filterVehicles(): void {
    
    const raw = this.searchVehicleTerm.trim().toLowerCase();
    if (!raw) {
      this.filteredVehicles = [...this.vehicles];
      return;
    }
    const terms = raw.split(/\s+/); // e.g. "subaru legacy" → ["subaru","legacy"]

    this.filteredVehicles = this.vehicles
      .map((vehicle) => {
        const makeLC = vehicle.value_name.toLowerCase();

        
        const makeMatchesAll = terms.every((t) => makeLC.includes(t));
        if (makeMatchesAll) {
          
          return { ...vehicle };
        }

      
        const matchingModels = vehicle.models.filter((model) => {
          const composite = (
            vehicle.value_name +
            ' ' +
            model.value_name
          ).toLowerCase();
          
          return terms.every((t) => composite.includes(t));
        });

        if (matchingModels.length) {
          
          return {
            ...vehicle,
            models: matchingModels,
          };
        }

        
        return null;
      })
      
      .filter((v): v is Vehicle => v !== null);
  }

  toggleModelVisibility(vehicle: Vehicle, event: Event): void {
    // Prevent the click from triggering the make checkbox
    event.stopPropagation();

    // Toggle the model visibility
    vehicle.showModels = !vehicle.showModels;
  }

  private clearAllSelections(): void {
    this.selectedVehicle = null;
    this.selectedModel = null;

    this.vehicles.forEach((v) => {
      v.selectedModel = null;
      v.showModels = false;
    });

  }

  onVehicleCheckboxChange(vehicle: Vehicle): void {
    // If this vehicle is already selected (without a specific model)
    const isDeselect = this.selectedVehicle === vehicle.value_name && !this.selectedModel;
    
    if (isDeselect) {
      // Uncheck the make
      this.deselectVehicle(vehicle);
    } else {
      // Select this make (and deselect any previously selected make/model)
      this.selectVehicle(vehicle);
    }
  }

  onVehicleModelChange(vehicle: Vehicle, modelName: string): void {
    // If this exact make+model combo is already selected
    const isDeselect = 
      this.selectedVehicle === vehicle.value_name && 
      this.selectedModel === modelName;
    
    if (isDeselect) {
      // Uncheck the model but keep the make selected
      this.deselectModel(vehicle);
    } else {
      // Select this model (and deselect any previously selected model)
      this.selectModel(vehicle, modelName);
    }
  }

  private deselectVehicle(vehicle: Vehicle) {
    // Clear local state
    this.selectedVehicle = null;
    this.selectedModel = null;
    
    // Update service state
    this.filterSearchService.clearSelectedMake();
    // Note: clearSelectedMake already clears the model too
    
    // Collapse model list
    vehicle.showModels = false;
    
    // Update UI
    this.cdr.detectChanges();
  }
  
  private deselectModel(vehicle: Vehicle) {
    // Clear model but keep make selected
    this.selectedModel = null;
    
    // Update service state
    this.filterSearchService.clearSelectedModel();
    
    // Keep models visible for convenience
    vehicle.showModels = true;
    
    // Update UI
    this.cdr.detectChanges();
  }
  
  private selectVehicle(vehicle: Vehicle) {
    // First clear any previous selections
    this.clearAllSelections();
    
    // Set new selection
    this.selectedVehicle = vehicle.value_name;
    this.selectedModel = null;
    
    // Update service state
    this.filterSearchService.updateSelectedMake(vehicle.value_name);
    this.filterSearchService.clearSelectedModel();
    
    // Expand this vehicle's models
    vehicle.showModels = true;
    
    // Update UI
    this.cdr.detectChanges();
  }
  
  private selectModel(vehicle: Vehicle, modelName: string) {
    // First clear any previous selections
    this.clearAllSelections();
    
    // Set new selection
    this.selectedVehicle = vehicle.value_name;
    this.selectedModel = modelName;
    
    // Update service state - this will trigger search only once
    this.filterSearchService.updateMakeAndModel(vehicle.value_name, modelName);
    
    // Make sure models are visible
    vehicle.showModels = true;
    
    // Update UI
    this.cdr.detectChanges();
  }

  onMakeChange(make: string | null): void {
    this.selectedVehicle = make;

    // <<< reset model state whenever the make changes >>>
    this.selectedModel = null;
    this.filterSearchService.clearSelectedModel();

    this.filterSearchService.updateSelectedMake(make);
    console.log('FilterComponent: onMakeChange triggered with make:', make);
  }

  getBrands(): void {
    this.getBrandsService.fetchBrands().subscribe(
      (data) => {
        this.brands = data.map((brand) => ({
          ...brand,
          selected: false,
        }));
        this.filteredBrands = [...this.brands];

        // ✅ Restore selected brand name after brands are loaded
        const savedBrandId = this.filterSearchService.selectedBrandValue;
        if (savedBrandId !== null) {
          const selected = this.brands.find((b) => b.id === savedBrandId);
          if (selected) {
            this.selectedBrand = savedBrandId;
            this.selectedBrandName = selected.name;
          }
        }
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
  filterBrands() {
    const term = this.searchTerm.toLowerCase();
    this.filteredBrands = this.brands.filter((brand) =>
      brand.name.toLowerCase().includes(term)
    );
  }
  onBackClick(): void {
    this.navigationService.goBack();
    this.filterSearchService.clearAllFilters();
    this.categoryNavbarSearchService.clearCategoryData();
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

  onCheckboxChange(brandId: number, brandName: string): void {
    // If the selected brand is the same, deselect it
    if (this.selectedBrand === brandId) {
      this.selectedBrand = null;
      this.selectedBrandName = null; // <-- Add this to clear name
      this.filterSearchService.clearSelectedBrand();
      console.log('Brand deselected:', brandId);
    } else {
      // Deselect all brands and select the new one
      this.brands.forEach((brand) => (brand.selected = false));

      const selectedBrand = this.brands.find((brand) => brand.id === brandId);
      if (selectedBrand) {
        selectedBrand.selected = true;
        this.selectedBrand = brandId;
        this.selectedBrandName = brandName; // <-- Add this to show the name
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
      return category.firstSubCategories.some(
        (sub: any) =>
          sub.selected ||
          (sub.secondSubCategories &&
            sub.secondSubCategories.some((secSub: any) => secSub.selected))
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
      return subCategory.secondSubCategories.some(
        (secondSub: any) => secondSub.selected
      );
    }
    return false;
  }

  isAnyOtherFirstSubCategorySelected(
    currentSubCategory: any,
    category: any
  ): boolean {
    if (!category.firstSubCategories) return false;

    return category.firstSubCategories.some((firstSub: any) => {
      if (firstSub === currentSubCategory) return false;

      // Check if this first subcategory is selected
      if (firstSub.selected) return true;

      // Check if any of its second subcategories are selected
      if (firstSub.secondSubCategories) {
        return firstSub.secondSubCategories.some(
          (secondSub: any) => secondSub.selected
        );
      }

      return false;
    });
  }

  // Disable main categories if any subcategories or second subcategories are selected

  onMainCategoryChange(selectedCategory: any): void {
    // If category is unchecked, deselect all its children
    if (!selectedCategory.selected) {
      if (selectedCategory.firstSubCategories) {
        selectedCategory.firstSubCategories.forEach((sub: any) => {
          sub.selected = false;
          if (sub.secondSubCategories) {
            sub.secondSubCategories.forEach(
              (secSub: any) => (secSub.selected = false)
            );
          }
        });
      }
    }
    // Deselect all other main categories and their subcategories
    this.mainCategories.forEach((category) => {
      if (category !== selectedCategory) {
        category.selected = false;

        // Deselect all first and second subcategories of the unselected main category
        if (category.firstSubCategories) {
          category.firstSubCategories.forEach((sub: any) => {
            sub.selected = false;
            if (sub.secondSubCategories) {
              sub.secondSubCategories.forEach(
                (secSub: any) => (secSub.selected = false)
              );
            }
          });
        }
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
          sub.secondSubCategories.forEach(
            (secSub: any) => (secSub.selected = false)
          );
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
    const parentCategory = this.mainCategories.find((category) =>
      category.firstSubCategories?.some((sub: any) => sub === subCategory)
    );

    if (!parentCategory) return;

    // Deselect all other first subcategories of the same main category
    parentCategory.firstSubCategories.forEach((firstSub: any) => {
      if (firstSub !== subCategory) {
        firstSub.selected = false;

        // Deselect all second subcategories if the parent first subcategory is deselected
        if (firstSub.secondSubCategories) {
          firstSub.secondSubCategories.forEach(
            (secSub: any) => (secSub.selected = false)
          );
        }
      }
    });

    // Prevent selection if parent category is not checked
    if (!parentCategory?.selected) {
      subCategory.selected = false;
      return;
    }

    // If first subcategory is unchecked, uncheck second subcategories
    if (!subCategory.selected) {
      if (subCategory.secondSubCategories) {
        subCategory.secondSubCategories.forEach(
          (secSub: any) => (secSub.selected = false)
        );
      }
    }

    // Clear second subcategories when switching first subcategories
    if (!subCategory.selected) {
      if (subCategory.secondSubCategories) {
        subCategory.secondSubCategories.forEach(
          (secSub: any) => (secSub.selected = false)
        );
      }
      this.secondSubCategories = [];
      this.selectedSecondSubCategory = null;
    }

    // Update selectedFirstSubCategory
    this.selectedFirstSubCategory = subCategory.selected
      ? subCategory.id
      : null;

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

  onSecondSubCategoryChange(
    subCategory: any,
    selectedSecondSubCategory: any
  ): void {
    // Prevent selection if first subcategory is not checked
    if (!subCategory.selected) {
      selectedSecondSubCategory.selected = false;
      return;
    }
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
