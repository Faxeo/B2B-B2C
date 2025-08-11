import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ProductDetailsService,
  ProductDetails,
} from '../../core/services/product-details/product-details.service';
import { GetLinkedProductsService } from '../../core/services/get-linked-products/get-linked-products.service'; 
import { FooterComponent } from '../../layout/footer/footer.component';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { CartService } from '../../core/services/cart/cart.service';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { NavigationService } from '../../core/services/navigation-service/navigation-service.service';
import { SubCategoryService } from '../../core/services/sub-category/sub-category.service';
import { MainCategoryService } from '../../core/services/main-category/main-category.service';
import { FetchChildService } from '../../core/services/fetch-child/fetch-child.service';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { CarouselModule } from 'primeng/carousel';

interface Testimonial {
  customerName: string;
  text: string;
}

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, FooterComponent, FormsModule, CarouselModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  animations: [
    trigger('shakeButton', [
      transition('* => *', [
        animate('0.7s ease-in-out', keyframes([
          style({ transform: 'translateX(-12px)', offset: 0.1 }),
          style({ transform: 'translateX(12px)', offset: 0.2 }),
          style({ transform: 'translateX(-10px)', offset: 0.3 }),
          style({ transform: 'translateX(10px)', offset: 0.4 }),
          style({ transform: 'translateX(-8px)', offset: 0.5 }),
          style({ transform: 'translateX(8px)', offset: 0.6 }),
          style({ transform: 'translateX(-5px)', offset: 0.7 }),
          style({ transform: 'translateX(5px)', offset: 0.8 }),
          style({ transform: 'translateX(0)', offset: 1.0 })
        ]))
      ])
    ])
  ]
})

export class ProductDetailsComponent {
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
  // mainImage: string = '';
  quantity: number = 1;
  isLoading: boolean = false;
  linkedProducts: any[] = []; // New property to store linked products
  

  // New properties for company and variant selection
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
  autoplayInterval: number = 3000;   
  // product: any;
  // mainImage: string;
  // zoomed: boolean = false;
  // zoomTransform: string = 'scale(1)';
  // currentImageIndex: number = 0;
  // zoomOriginX: number = 50;
  // zoomOriginY: number = 50;
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
  shakeTrigger = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private productDetailsService: ProductDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private loginService: LoginService,
    private navigationService: NavigationService,
    private fetchChildService: FetchChildService,
    private mainCategoryService: MainCategoryService,
    private subCategoryService: SubCategoryService,
    private getLinkedProductsService: GetLinkedProductsService // Inject the new service
  ) {
    setInterval(() => {
      this.shakeTrigger = !this.shakeTrigger;
    }, 5000); // Trigger shake every 5 seconds
  }

  ngOnInit(): void {
  this.getMainCategories();

  if (isPlatformBrowser(this.platformId)) {
    this.userID = localStorage.getItem('userID');
    this.loginService.getUserID().subscribe((userID) => {
      this.userID = userID;
      this.cartService.setUserDetails(this.userID, this.loginType);
    });

    this.loginService.getLoginType().subscribe((loginType) => {
      this.loginType = loginType;
      if (this.loginType === 'business') {
        const username = localStorage.getItem('username');
        this.loginType = username || this.loginType;
      }
      this.cartService.setUserDetails(this.userID, this.loginType);
    });
  }

  this.cartService.cartItemCount$.subscribe((count) => {
    this.cartItemCount = count;
  });

  this.startTestimonialSlider();

  // 🔁 Subscribe to route changes
  this.route.paramMap.subscribe((params) => {
  const productId = Number(params.get('id'));
  if (!isNaN(productId)) {
    this.fetchProductDetails(productId, true); // 👈 pass a flag
  } else {
      console.error('Invalid product ID');
    }
  });

  }

  // Fetch product details when the component is initialized
  fetchLinkedProducts(productId: number): void {
    this.getLinkedProductsService.getLinkedProducts(productId).subscribe({
      next: (linkedProducts) => {
        // The service returns the response directly, which should be the array
        this.linkedProducts = linkedProducts;
      },
      error: (err) => {
        console.error('Error fetching linked products:', err);
      },
    });
  }

  // Set the main image
  setMainImage(imageUrl: string, index: number): void {
    this.mainImage = imageUrl;
    this.currentImageIndex = index;
  }

  // setMainImage(imagePath: string): void {
  //   this.mainImage = imagePath;
  // }

  // Navigate to the previous image
  prevImage(): void {
    if (this.product?.images?.length) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.product.images.length) %
        this.product.images.length;
      this.setMainImage(
        this.imageBaseUrl + this.product.images[this.currentImageIndex].image_path,
        this.currentImageIndex
      );
    }
  }

  // Navigate to the next image
  nextImage(): void {
    if (this.product?.images?.length) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.product.images.length;
      this.setMainImage(
         this.imageBaseUrl + this.product.images[this.currentImageIndex].image_path,
        this.currentImageIndex
      );
    }
  }

  // Toggle zoom on image click
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
      
      // Enhanced sensitivity calculation
      const sensitivity = 1; // Adjust this value to increase/decrease sensitivity
      const centerX = 50;
      const centerY = 50;
      
      // Calculate offset from center with increased sensitivity
      const offsetX = (x - centerX) * sensitivity;
      const offsetY = (y - centerY) * sensitivity;
      
      // Apply the offset to create more sensitive movement
      this.zoomOriginX = Math.min(Math.max(centerX + offsetX, 10), 90);
      this.zoomOriginY = Math.min(Math.max(centerY + offsetY, 10), 90);
    }, 5); // Even faster response time
  }

  resetZoom(): void {
    this.zoomed = false;
    this.zoomTransform = 'scale(1)';
    this.zoomOriginX = 50;
    this.zoomOriginY = 50;
  }

  // Open the image in fullscreen
  // Open the custom fullscreen overlay
  openFullScreen(): void {
    this.isFullScreen = true;
    this.resetZoom(); // Reset zoom when entering fullscreen
  }

  // Close the custom fullscreen overlay
  closeFullScreen(): void {
    this.isFullScreen = false;
    this.resetZoom(); // Reset zoom when exiting fullscreen
  }

  stopAutoplay(): void {
    this.autoplayInterval = 0;
  }

  startAutoplay(): void {
    this.autoplayInterval = 3000;
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
    this.router.navigate(['/B2B']);
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

    // Use the selected quantity from the component
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


  // Quantity management methods
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
    }, 3000); // Change testimonial every 3 seconds
  }

  ngOnDestroy(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
  }

  get transformStyle(): string {
    return `translateX(-${this.currentTestimonialIndex * 100}%)`;
  }

  responsiveOptions: any[] = [
  {
    breakpoint: '12000000px',
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1,
    },
  ];

  fetchProductDetails(productId: number, scrollAfterLoad: boolean = false): void {
  this.productDetailsService.getProductByID(productId).subscribe({
    next: (data) => {
      if (data) {
        this.product = data;
        this.fetchLinkedProducts(productId);

        if (data.images?.length) {
          this.mainImage = this.imageBaseUrl + data.images[0].image_path;
        } else if (data.product_image) {
          this.mainImage = this.imageBaseUrl + `Images/Products/${data.product_image}`;
        }

        if (scrollAfterLoad && isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 200); // Delay ensures DOM update
        }

      } else {
        console.error('No product data found');
      }
    },
    error: (err) => {
      console.error('Error fetching product details:', err);
    },
  });
}

  // Methods to handle company and variant selection
  selectCompany(company: string): void {
    this.selectedCompany = company;
  }

  selectVariant(variant: string): void {
    this.selectedVariant = variant;
  }

  buyNow(product: any) {
    this.addToCart(product); // Call the existing Add to Cart function
    this.router.navigate(['/B2B/cart']); // Navigate to the cart page
  }
}
