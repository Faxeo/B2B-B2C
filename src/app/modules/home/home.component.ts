import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [ApiService], // Add this line
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  categories$: Observable<any[]> | undefined;
  products$: Observable<any[]> | undefined;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.categories$ = this.apiService.getMainCategory().pipe(
      map(categories => categories.map((category: { name: string; }) => ({
        ...category,
        // image: `assets/${category.name.toLowerCase().replace(/ /g, '-')}.png`
        image: `assets/car-parts-&-accessories.png`
      })))
    );

    this.products$ = this.apiService.getProducts().pipe(
      map(products => products.map((product: { product_image: string; }) => ({
        ...product,
        image: `${product.product_image}`
      })))
    );
  }
}
