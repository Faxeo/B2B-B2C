import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckoutService } from '../../services/checkout/checkout.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
    imports: [ReactiveFormsModule],
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup = this.fb.group({});
  checkoutPayload: any;
  sandboxAppID = 'sandbox-sq0idb-d65sQ2oY6m31SyMvrxc6eg'; // Sandbox App ID
  sandBoxLocationID = 'L0HH4QHVKNCHR'; // Sandbox Location ID
  selectedWallet: string | null = null;
  isBrowser: boolean; // To track whether code is running in the browser
  isLoading: boolean = false; // Loading state

  constructor(
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    @Inject(PLATFORM_ID) private platformId: any,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private cartService: CartService,
    private ngZone: NgZone,
    private toastr: ToastrService, 
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {

      const userID = this.cartService.getUserID();
      // Retrieve cart items and billing details from localStorage
      const savedCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const savedBillingDetails = JSON.parse(localStorage.getItem('billingDetails') || '{}');

      // Log to check the saved data (optional)
      console.log('Retrieved Cart Items from Storage:', savedCartItems);
      console.log('Retrieved Billing Details from Storage:', savedBillingDetails);

      // Use the saved cart items and billing details in the component
      this.checkoutPayload = savedCartItems;

      // Initialize form with billing details
      this.checkoutForm = this.fb.group({
        fullName: [savedBillingDetails.fullName || '', [Validators.required]],
        email: [savedBillingDetails.email || '', [Validators.required, Validators.email]],
        contact: [savedBillingDetails.contact || '', [Validators.required]],
        billingAddress: [savedBillingDetails.billingAddress || '', [Validators.required]],
        country: [savedBillingDetails.country || 'United States', [Validators.required]],
        state: [savedBillingDetails.state || '', [Validators.required]],
        city: [savedBillingDetails.city || '', [Validators.required]],
        zipcode: [savedBillingDetails.zipcode || '', [Validators.required]],
        cardName: ['', [Validators.required]],
        cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
        expiryDate: ['', [Validators.required, Validators.pattern('(0[1-9]|1[0-2])/[0-9]{2}')]],
        cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      });

      // Load the Square payment script and initialize the card payment
      this.loadSquareScript()
        .then(() => {
          this.initializeCardPayment();
        })
        .catch((error: any) => {
          console.error('Error loading Square script', error);
        });
    } else {
      console.warn('Running on the server, skipping browser-specific code.');
    }
  }

  // Dynamically load the Square payments script, only in browser
  loadSquareScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        return reject('Square payments can only be loaded in the browser.');
      }

      if (document.getElementById('square-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'square-script';
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);

      document.body.appendChild(script);
    });
  }

  async initializeCardPayment() {
    if (!this.isBrowser) {
      console.warn('Square payments initialization skipped on server');
      return;
    }

    try {
      const payments = (window as any).Square.payments(this.sandboxAppID, this.sandBoxLocationID);
      const card = await payments.card();
      await card.attach('#card-container');

      const cardButton = document.getElementById('card-button');
      cardButton?.addEventListener('click', async () => {
        await this.processPayment(card, cardButton);
      });
    } catch (error) {
      console.error('Error initializing Square payments', error);
    }
  }

  async processPayment(card: any, cardButton: HTMLElement, retries = 3) {
    // Show loading state
    this.isLoading = true;

    try {
      const result = await card.tokenize();

      if (result.status === 'OK') {
        console.log(`Payment token is ${result.token}`);
        await this.createPaymentOrder(result.token);
      } else {
        let errorMessage = `Tokenization failed with status: ${result.status}`;
        if (result.errors) {
          errorMessage += ` and errors: ${JSON.stringify(result.errors)}`;
        }
        throw new Error(errorMessage);
      }
    } catch (e) {
      console.error(e);
      this.isLoading = false;
    }
  }

  createPaymentOrder(token: string): void {
    this.isLoading = true;

    const billing = this.checkoutForm.value;
    const cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');

    const dto = {
      orderItems: cartItems.map(i => ({
        productId: i.productId,
        name: i.name,
        upc: i.upc,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
      })),
      totalAmount: cartItems.reduce((sum, i) => sum + (i.discountedPrice || i.price) * i.quantity, 0),
      totalQuantity: cartItems.reduce((sum, i) => sum + i.quantity, 0),
      nonce: token,
      billingAddress: {
        shippingName: billing.fullName,
        shippingEmail: billing.email,
        address: billing.billingAddress,
        city: billing.city,
        country: billing.country,
        state: billing.state,
        zipCode: billing.zipcode,
        contact: billing.contact,
      },
      customerID: +(localStorage.getItem('userID') || 0),
      businessID: 0,
    };

    this.checkoutService.processCheckout(dto).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.success && res.statusCode === 200) {
          this.toastr.success('Thanks for shopping with us.', 'Payment Successful');

          const billData = {
            transactionID: res.data.transactionID,
            date: new Date().toLocaleDateString(),
            orderItems: dto.orderItems,
            totalAmount: dto.totalAmount,
            totalQuantity: dto.totalQuantity,
            billingAddress: dto.billingAddress,
          };

          this.clearCart();
          this.router.navigate(['/B2B/bill'], { state: { billData } });
        }
        else if (res.statusCode === 400) {
          this.toastr.error(res.statusReason || 'Unknown error', 'Payment Failed');
        }
        else {
          this.toastr.warning('Unexpected response. Please try again.', 'Oops…');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Checkout error:', err);
        this.toastr.error('An error occurred during checkout.', 'Error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  clearCart() {
    localStorage.removeItem('cartItems'); // Clear cart items from localStorage
    console.log('Cart cleared from localStorage');
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      console.log('Payment submitted', this.checkoutForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}