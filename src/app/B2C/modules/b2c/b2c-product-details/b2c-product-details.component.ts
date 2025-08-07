import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';

import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { ProductDetails } from '../../../../core/services/product-details/product-details.service';
import { ProductDetailsService } from '../../../../core/services/product-details/product-details.service';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { LoginService } from '../../../../core/services/login-service/login-service.service';
import { CartService } from '../../../../core/services/cart/cart.service';
import { AddToCartService } from '../../../../core/services/add-to-cart/add-to-cart.service';
import { NavigationService } from '../../../../core/services/navigation-service/navigation-service.service';
import { SubCategoryService } from '../../../../core/services/sub-category/sub-category.service';
import { MainCategoryService } from '../../../../core/services/main-category/main-category.service';
import { GetLinkedProductsService } from '../../../../core/services/get-linked-products/get-linked-products.service'; 
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';

import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

interface Testimonial {
  customerName: string;
  text: string;
}

@Component({
  selector: 'app-b2c-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent, NgbCarouselModule],
  templateUrl: './b2c-product-details.component.html',
  styleUrls: ['./b2c-product-details.component.css'],
})
export class B2cProductDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  testimonials: Testimonial[] = [
    {
      customerName: 'Gavin',
      text: 'Always highly responsive, great customer service and always an awesome price.',
    },
    {
      customerName: 'Sophia',
      text: 'Excellent quality, received exactly as described. Highly recommended!',
    },
    {
      customerName: 'Liam',
      text: 'Fast shipping and fantastic customer support. Very satisfied!',
    },
    {
      customerName: 'Olivia',
      text: 'Great value for money, and the parts are truly genuine!',
    },
    {
      customerName: 'Noah',
      text: 'Top-notch products and quick delivery. Will buy again!',
    },
    {
      customerName: 'Emma',
      text: 'Very reliable and trustworthy seller. Excellent experience overall.',
    },
  ];

  currentTestimonialIndex: number = 0;
  testimonialInterval: any;

  product: ProductDetails | null = null;
  quantity: number = 1;
  isLoading: boolean = false;
  linkedProducts: any[] = []; // New property to store linked products
  

  selectedCompany: string | null = null;
  selectedVariant: string | null = null;

  userID: string | null = null;
  message: string = '';
  showMessage: boolean = false;
  showAlert: boolean = false;
  cartItemCount: number = 0;
  mainCategories: any[] = [];
  firstSubCategories: any[] = [];
  secondSubCategories: any[] = [];
  groupedLinkedProducts: any[][] = [];
  autoplayInterval: number = 3000; 

  @Input() loginType: string | null = null;
  isFullScreen: boolean = false;
  private zoomTimeout: any;
  zoomed: boolean = false;
  zoomTransform: string = 'scale(1)';
  zoomOriginX: number = 50;
  zoomOriginY: number = 50;
  currentImageIndex: number = 0;
  mainImage: string = '';
  private zoomScale: number = 2.5;
  private debounceTimer: any;

  readonly imageBaseUrl = 'https://usaperp.com:5001/';
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private productDetailsService: ProductDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private loginService: LoginService,
    private navigationService: NavigationService,
    private mainCategoryService: MainCategoryService,
    private getLinkedProductsService: GetLinkedProductsService // Inject the service
  ) {}

  stopAutoplay(): void {
    this.autoplayInterval = 0;
  }

  startAutoplay(): void {
    this.autoplayInterval = 3000;
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const id = Number(params.get('id'));
        if (isNaN(id)) {
          console.error('Invalid product ID');
          return new Observable<ProductDetails | null>((observer) => {
            observer.next(null);
            observer.complete();
          });
        }
        this.isLoading = true;
        this.fetchLinkedProducts(id); 
        return this.productDetailsService.getProductByID(id);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: data => {
        this.product = data;
        this.isLoading = false;
        if (data) {
          let filePath: string;
          if (data.images?.length) {
            this.currentImageIndex = 0;
            filePath = data.images[0].image_path;
          } else if (data.product_image) {
            filePath = `Images/Products/${data.product_image}`;
          } else {
            return;
          }
          this.mainImage = this.imageBaseUrl + filePath;
          // console.log(' loading:', this.mainImage);
          if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        }
      },
      error: err => {
        console.error('Error fetching product details:', err);
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startTestimonialSlider();
    }
  }

  fetchLinkedProducts(productId: number): void {
  this.getLinkedProductsService.getLinkedProducts(productId).subscribe({
    next: (linkedProducts) => {
      this.linkedProducts = linkedProducts;
      this.groupedLinkedProducts = this.groupIntoChunks(linkedProducts, 4); // <-- NEW
    },
    error: (err) => {
      console.error('Error fetching linked products:', err);
      },
    });
  }

  private groupIntoChunks(array: any[], chunkSize: number): any[][] {
    const result: any[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  setMainImage(imageUrl: string, index: number): void {
    this.mainImage = imageUrl;
    this.currentImageIndex = index;
  }

  prevImage(): void {
    if (this.product?.images?.length) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.product.images.length) %
        this.product.images.length;
      this.setMainImage(
        'https://usaperp.com:5001/' +
          this.product.images[this.currentImageIndex].image_path,
        this.currentImageIndex
      );
    }
  }

  nextImage(): void {
    if (this.product?.images?.length) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.product.images.length;
      this.setMainImage(
        'https://usaperp.com:5001/' +
          this.product.images[this.currentImageIndex].image_path,
        this.currentImageIndex
      );
    }
  }

  toggleZoom(event: MouseEvent): void {
    this.zoomed = !this.zoomed;

    if (this.zoomed) {
      const rect = (event.target as HTMLImageElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      this.zoomTransform = `scale(${this.zoomScale})`;
      this.zoomOriginX = x;
      this.zoomOriginY = y;
    } else {
      this.resetZoom();
    }
  }

  onImageMouseMove(event: MouseEvent): void {
    if (!this.zoomed) return;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      const rect = (event.target as HTMLImageElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const sensitivity = 1;
      const centerX = 50;
      const centerY = 50;

      const offsetX = (x - centerX) * sensitivity;
      const offsetY = (y - centerY) * sensitivity;

      this.zoomOriginX = Math.min(Math.max(centerX + offsetX, 10), 90);
      this.zoomOriginY = Math.min(Math.max(centerY + offsetY, 10), 90);
    }, 5);
  }

  resetZoom(): void {
    this.zoomed = false;
    this.zoomTransform = 'scale(1)';
    this.zoomOriginX = 50;
    this.zoomOriginY = 50;
  }

  openFullScreen(): void {
    this.isFullScreen = true;
    this.resetZoom();
  }

  closeFullScreen(): void {
    this.isFullScreen = false;
    this.resetZoom();
  }

  getMainCategories(): void {
    this.mainCategoryService.getMainCategories().subscribe(
      (data: any[]) => {
        if (Array.isArray(data)) {
          this.mainCategories = data.map((category) => ({
            id: category.id,
            name: category.name,
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

  onBackClick(): void {
    this.navigationService.goBack();
  }

  onExitClick(): void {
    this.router.navigate(['/B2C']);
  }

  addToCart(product: {
    product_id: number;
    product_name: string;
    product_price: number;
    product_image: string;
    product_identifier2: string;
  }): void {
    const userID = this.userID || '';
    const businessId = this.userID ? +this.userID : 0;
    const upc = product.product_identifier2;

    const selectedQuantity = this.quantity;

    this.addToCartService
      .addToCart(product.product_id, userID, businessId, selectedQuantity)
      .subscribe({
        next: () => {
          this.cartService.addToCart({
            productId: product.product_id.toString(),
            name: product.product_name,
            price: product.product_price,
            image: product.product_image,
            quantity: selectedQuantity,
            upc: upc,
          });
          this.displayMessage('Item added to cart successfully!');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          this.displayMessage('Error adding item to cart: ' + error.message);
        },
      });
  }

  increaseQuantity(): void {
    this.quantity += 1;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  displayMessage(msg: string): void {
    this.message = msg;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 1000);
  }

  startTestimonialSlider(): void {
    this.testimonialInterval = setInterval(() => {
      this.currentTestimonialIndex =
        (this.currentTestimonialIndex + 1) % this.testimonials.length;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  get transformStyle(): string {
    return `translateX(-${this.currentTestimonialIndex * 100}%)`;
  }

  selectCompany(company: string): void {
    this.selectedCompany = company;
  }

  selectVariant(variant: string): void {
    this.selectedVariant = variant;
  }

  buyNow(product: any) {
    this.addToCart(product);
    this.router.navigate(['/B2C/cart']);
  }
}