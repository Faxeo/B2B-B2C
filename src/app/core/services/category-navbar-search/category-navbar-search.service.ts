import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryNavbarSearchService {
  private m_id: number | null = null;
  private f_id: number | null = null;
  private s_id: number | null = null;

  constructor() {}

  // Set the values  
  setCategoryData(m_id: number | null, f_id: number | null, s_id: number | null): void {
    this.m_id = m_id;
    this.f_id = f_id;
    this.s_id = s_id;
  }

  // Get the values
  getCategoryData(): { m_id: number | null; f_id: number | null; s_id: number | null } {
    return { m_id: this.m_id, f_id: this.f_id, s_id: this.s_id };
  }

  // Clear the values
  clearCategoryData(): void {
    this.m_id = null;
    this.f_id = null;
    this.s_id = null;
  }
}
 