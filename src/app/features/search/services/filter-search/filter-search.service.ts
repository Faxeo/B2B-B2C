import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterSearchService {
  constructor() {}

  searchRequested = new EventEmitter<string>();

  // Categories BehaviorSubject
  private selectedCategoriesSource = new BehaviorSubject<{
    m_id: number | null;
    f_id: number | null;
    s_id: number | null;
  }>({ m_id: null, f_id: null, s_id: null });
  selectedCategories$ = this.selectedCategoriesSource.asObservable();

  // Add this getter to FilterSearchService
  get selectedBrandValue(): number | null {
    return this.selectedBrandSource.value;
  }

  get selectedCategoriesValue(): {
    m_id: number | null;
    f_id: number | null;
    s_id: number | null;
  } {
    return this.selectedCategoriesSource.value;
  }

  // Brands BehaviorSubject (Updated to number | null)
  private selectedBrandSource = new BehaviorSubject<number | null>(null);
  selectedBrand$ = this.selectedBrandSource.asObservable();

  private selectedMakeSource = new BehaviorSubject<string | null>(null);
  selectedMake$ = this.selectedMakeSource.asObservable();

  // **New: Model BehaviorSubject (string | null)**
  private selectedModelSource = new BehaviorSubject<string | null>(null);
  selectedModel$ = this.selectedModelSource.asObservable();

  // Flag to prevent double updates
  private isUpdatingVehicle = false;

  getCurrentFilters() {
    return {
      categories: this.selectedCategoriesSource.value,
      brand: this.selectedBrandSource.value,
      make: this.selectedMakeSource.value,
      model: this.selectedModelSource.value
    };
  }

// Add this method to your FilterSearchService class

/**
 * Trigger a search with the current filter state
 * This should be called after any filter change that should refresh the results
 */
/**
 * Trigger a search with the current filter state
 * This should be called after any filter change that should refresh the results
 */
triggerSearch(): void {
  // Get current filter state using your existing methods
  const filters = this.getCurrentFilters();
  
  // Emit event to request a search with current filters
  this.searchRequested.emit('filter-changed');
  
  console.log('Search triggered with filters:', filters);
}

  // New method to update both make and model together
  // New method to update both make and model together
updateMakeAndModel(make: string | null, model: string | null): void {
  console.log('FilterSearchService: Updating make and model together:', make, model);
  
  this.isUpdatingVehicle = true;
  
  // Update the values
  this.selectedMakeSource.next(make);
  this.selectedModelSource.next(model);
  
  this.isUpdatingVehicle = false;
  
  // Trigger search only once
  this.triggerSearch();
  
  console.log('FilterSearchService: Updated make and model to:', make, model);
}

updateSelectedMake(make: string | null): void {
  // If we're already in the process of updating both make and model, don't emit
  if (this.isUpdatingVehicle) return;
  
  console.log('FilterSearchService: Received make:', make);
  this.selectedMakeSource.next(make);
  console.log('FilterSearchService: Emitted new make value:', make);
  
  // Trigger search after updating the make
  this.triggerSearch();
}

clearSelectedMake(): void {
  // If we're already in the process of updating both make and model, don't emit
  if (this.isUpdatingVehicle) return;
  
  this.selectedMakeSource.next(null);
  // also clear the model whenever make goes null
  this.clearSelectedModel();
  console.log('Cleared make—and model— in service.');
  
  // Trigger search after clearing
  this.triggerSearch();
}

updateSelectedModel(model: string | null): void {
  // If we're already in the process of updating both make and model, don't emit
  if (this.isUpdatingVehicle) return;
  
  console.log('FilterSearchService: Received model:', model);
  this.selectedModelSource.next(model);
  console.log('FilterSearchService: Emitted new model value:', model);
  
  // Trigger search after updating the model
  this.triggerSearch();
}

clearSelectedModel(): void {
  // If we're already in the process of updating both make and model, don't emit
  if (this.isUpdatingVehicle) return;
  
  this.selectedModelSource.next(null);
  console.log('Cleared selected model in service.');
  
  // Only trigger search if we're not in a batch update
  if (!this.isUpdatingVehicle) {
    this.triggerSearch();
  }
}
  
  // Update categories
  updateSelectedCategories(
    m_id: number | null,
    f_id: number | null,
    s_id: number | null
  ): void {
    this.selectedCategoriesSource.next({ m_id, f_id, s_id });
    console.log('Updated categories in service:', { m_id, f_id, s_id });
  }

  updateSelectedBrand(brandId: number | null): void {
    this.selectedBrandSource.next(brandId);
    console.log('Updated brand in service:', brandId);
  }

  // Keep updateSelectedBrands if needed for multiple brands
  updateSelectedBrands(brandIds: number[]): void {
    console.log('Selected brands:', brandIds);
  }

  // Call this method to update the selected brand ID
  setSelectedBrand(brandId: number | null): void {
    this.selectedBrandSource.next(brandId);
  }

  clearSelectedBrand(): void {
    this.selectedBrandSource.next(null);
    console.log('Cleared selected brand in service.');
  }

  // **Update Selected Model**
  // updateSelectedModel(model: string | null): void {
  //   // If we're already in the process of updating both make and model, don't emit
  //   if (this.isUpdatingVehicle) return;
    
  //   console.log('FilterSearchService: Received model:', model);
  //   this.selectedModelSource.next(model);
  //   console.log('FilterSearchService: Emitted new model value:', model);
  // }

  // clearSelectedModel(): void {
  //   // If we're already in the process of updating both make and model, don't emit
  //   if (this.isUpdatingVehicle) return;
    
  //   this.selectedModelSource.next(null);
  //   console.log('Cleared selected model in service.');
  // }

  clearAllFilters(): void {
    // Clear categories
    this.selectedCategoriesSource.next({ m_id: null, f_id: null, s_id: null });

    // Clear brand
    this.selectedBrandSource.next(null);

    // Clear make and model
    this.isUpdatingVehicle = true;
    this.selectedMakeSource.next(null);
    this.selectedModelSource.next(null);
    this.isUpdatingVehicle = false;

    console.log('All filters cleared, including categories, brand, and make.');
  }
}