import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterSearchService {
  constructor() {}

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

get selectedCategoriesValue(): { m_id: number | null; f_id: number | null; s_id: number | null } {
  return this.selectedCategoriesSource.value;
}


  // Brands BehaviorSubject (Updated to number | null)
  private selectedBrandSource = new BehaviorSubject<number | null>(null);
  selectedBrand$ = this.selectedBrandSource.asObservable();
 
  // Update categories
  updateSelectedCategories(m_id: number | null, f_id: number | null, s_id: number | null): void {
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

  clearAllFilters(): void {
    this.selectedCategoriesSource.next({ m_id: null, f_id: null, s_id: null });
    this.selectedBrandSource.next(null);
    console.log('All filters cleared.');
  }
  
}
