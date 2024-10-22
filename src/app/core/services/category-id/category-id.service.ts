import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryIdService {

  private categoryId: number | null = null;

  // Method to set the category ID
  setCategoryId(id: number): void {
    this.categoryId = id;
  }

  // Method to get the stored category ID
  getCategoryId(): number | null {
    return this.categoryId;
  }

  // Method to clear the stored category ID
  clearCategoryId(): void {
    this.categoryId = null;
  }
}
