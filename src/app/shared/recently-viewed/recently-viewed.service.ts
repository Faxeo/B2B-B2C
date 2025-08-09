import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RecentlyViewedService {
  private storageKey = 'recentlyViewedProducts';
  private recentlyViewedSubject: BehaviorSubject<any[]>;
  recentlyViewed$;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize recentlyViewedSubject based on the platform
    const initialProducts = isPlatformBrowser(this.platformId) ? this.getRecentlyViewed() : [];
    this.recentlyViewedSubject = new BehaviorSubject<any[]>(initialProducts);
    this.recentlyViewed$ = this.recentlyViewedSubject.asObservable();
  }

  private getRecentlyViewed(): any[] {
    if (isPlatformBrowser(this.platformId)) {
      const products = localStorage.getItem(this.storageKey);
      return products ? JSON.parse(products) : [];
    }
    return [];
  }

  addProductToRecentlyViewed(product: any): void {
    if (isPlatformBrowser(this.platformId)) {
      let products = this.getRecentlyViewed();

      // Avoid duplicates
      products = products.filter((p) => p.product_id !== product.product_id);
      products.unshift(product);

      // Limit the number of recently viewed products to 20
      if (products.length > 20) {
        products.pop();
      }

      localStorage.setItem(this.storageKey, JSON.stringify(products));
      this.recentlyViewedSubject.next(products);
    }
  }

  removeProductFromRecentlyViewed(productId: number): void {
    if (isPlatformBrowser(this.platformId)) {
      let products = this.getRecentlyViewed();
      products = products.filter((product) => product.product_id !== productId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(products));
      this.recentlyViewedSubject.next(products); // Update the observable
    }
  }
}
