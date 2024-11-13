import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterSearchService {
  constructor() {}

  private selectedCategoriesSource = new BehaviorSubject<{
    m_id: number | null;
    f_id: number | null;
    s_id: number | null;
  }>({ m_id: null, f_id: null, s_id: null });
  selectedCategories$ = this.selectedCategoriesSource.asObservable();

  updateSelectedCategories(m_id: number, f_id: number, s_id: number): void {
    this.selectedCategoriesSource.next({ m_id, f_id, s_id });
    console.log('Setting categories in service:', { m_id, f_id, s_id });
  }  
}
