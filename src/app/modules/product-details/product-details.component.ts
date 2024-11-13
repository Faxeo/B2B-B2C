import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductDetailsService, ProductDetails } from '../../core/services/product-details/product-details.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { CartService } from '../../core/services/cart/cart.service';
import { AddToCartService } from '../../core/services/add-to-cart/add-to-cart.service';
import { NavigationService } from '../../core/services/navigation-service/navigation-service.service';
import { SubCategoryService } from '../../core/services/sub-category/sub-category.service';
import { MainCategoryService } from '../../core/services/main-category/main-category.service';
import { FetchChildService } from '../../core/services/fetch-child/fetch-child.service';

interface Testimonial {
  customerName: string;
  text: string;
}

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, FooterComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})


export class ProductDetailsComponent {

  testimonials: Testimonial[] = [
    { customerName: 'Gavin', text: 'Always highly responsive, great customer service and always an awesome price.' },
    { customerName: 'Sophia', text: 'Excellent quality, received exactly as described. Highly recommended!' },
    { customerName: 'Liam', text: 'Fast shipping and fantastic customer support. Very satisfied!' },
    { customerName: 'Olivia', text: 'Great value for money, and the parts are truly genuine!' },
    { customerName: 'Noah', text: 'Top-notch products and quick delivery. Will buy again!' },
    { customerName: 'Emma', text: 'Very reliable and trustworthy seller. Excellent experience overall.' }
  ];
  
  currentTestimonialIndex: number = 0;
  testimonialInterval: any;
  
  product: ProductDetails | null = null;
  mainImage: string = '';
  quantity: number = 1;
  isLoading: boolean = false;

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
  @Input() loginType: string | null = null;

  constructor(
    @Inject(PLATFORM_ID)private platformId: Object,
    private productDetailsService: ProductDetailsService,
    private route: ActivatedRoute,
    private addToCartService: AddToCartService,
    private cartService: CartService,
    private loginService: LoginService,
    private navigationService: NavigationService,
    private fetchChildService: FetchChildService,
    private mainCategoryService: MainCategoryService,
    private subCategoryService: SubCategoryService,
  ) {}

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
    const productId = Number(this.route.snapshot.params['id']);
    console.log('Product ID from route:', productId);
    if (!isNaN(productId)) {
      this.fetchProductDetails(productId);
    } else {
      console.error('Invalid product ID');
    }
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
      .addToCart(
        product.product_id,
        userID,
        businessId,
        selectedQuantity
      )
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
      this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
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

  fetchProductDetails(productId: number): void {
    this.productDetailsService.getProductByID(productId).subscribe({
      next: (data) => {
        // console.log('Product data received:', data);
        if (data) {
          this.product = data;
          this.mainImage = `https://usaperp.com:5001/Images/Products/${data.product_image}`;
        } else {
          console.error('No product data found');
        }
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
      }
    });
  }

  setMainImage(imagePath: string): void {
    this.mainImage = imagePath;
  }

  // Methods to handle company and variant selection
  selectCompany(company: string): void {
    this.selectedCompany = company;
  }

  selectVariant(variant: string): void {
    this.selectedVariant = variant;
  }


  buyNow(): void {
    console.log('Buy Now clicked for:', {
      productId: this.product?.product_id,
      quantity: this.quantity,
      company: this.selectedCompany,
      variant: this.selectedVariant,
    });
    alert('Proceeding to checkout...');
  }
}
