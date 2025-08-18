import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecentlyViewedService } from '../recently-viewed-service/recently-viewed.service';

import { Subscription } from 'rxjs';

@Component({
    imports: [],
    selector: 'app-recently-viewed',
    templateUrl: './recently-viewed.component.html',
    styleUrls: ['./recently-viewed.component.css']
})


export class RecentlyViewedComponent implements OnInit, OnDestroy {
  recentlyViewedProducts: any[] = [];
  private recentlyViewedSubscription: Subscription | null = null;


  constructor(private recentlyViewedService: RecentlyViewedService) {}

  ngOnInit(): void {
    this.recentlyViewedSubscription = this.recentlyViewedService.recentlyViewed$.subscribe(
      (products) => {
        this.recentlyViewedProducts = products;
      }
    );
  }

  ngOnDestroy(): void {
  if (this.recentlyViewedSubscription) {
    this.recentlyViewedSubscription.unsubscribe();
  }
}

removeProduct(productId: number): void {
  this.recentlyViewedService.removeProductFromRecentlyViewed(productId);
}

}