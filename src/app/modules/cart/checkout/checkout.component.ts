import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { CartService } from '../../../core/services/cart/cart.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
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
    private cartService: CartService,
    private ngZone: NgZone
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

  createPaymentOrder(token: string) {
    // Retrieve billing details from the form
    const billingDetails = this.checkoutForm.value;
  
    if (!billingDetails) {
      console.error('Billing details not found');
      this.isLoading = false; // Reset loading state if there's an error
      return;
    }
  
    // Retrieve cart items directly from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    console.log('Cart Items used for Checkout:', cartItems);
  
    // Calculate totalAmount and totalQuantity based on cart items
    const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.discountedPrice || item.price) * item.quantity, 0);
    const totalQuantity = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
    // Retrieve userID and loginType directly from localStorage
    const userID = localStorage.getItem('userID');
    const loginType = localStorage.getItem('loginType') || 'customer'; // Default to 'customer' if loginType is not available
  
    console.log('User ID:', userID);
    console.log('Login Type:', loginType);
  
    // Determine customerID or businessID based on loginType
    const customerID = loginType === 'customer' ? (userID ? parseInt(userID, 10) : 0) : 0;
    const businessID = loginType === 'business' ? (userID ? parseInt(userID, 10) : 0) : 0;
  
    // Create checkout DTO with the retrieved details
    const checkoutDTO = {
      orderItems: cartItems.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        upc: item.upc || '',
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      totalAmount: totalAmount,
      totalQuantity: totalQuantity,
      nonce: token, // Payment token
      billingAddress: {
        shippingName: billingDetails.fullName,
        shippingEmail: billingDetails.email,
        address: billingDetails.billingAddress,
        city: billingDetails.city,
        country: billingDetails.country,
        state: billingDetails.state,
        zipCode: billingDetails.zipcode,
        contact: billingDetails.contact,
      },
      customerID: customerID,
      businessID: businessID,
    };
  
    console.log('Updated Checkout DTO:', checkoutDTO);
  
    // Process the checkout using CheckoutService
    this.checkoutService.processCheckout(checkoutDTO).subscribe({
      next: (response: any) => {
        console.log('Checkout successful, response received:', response);
  
        if (response && response.success && response.statusCode === 200) {
          alert('Thanks for buying from us.');
          this.clearCart(); // Clear cart items on successful checkout
        } else if (response && response.statusCode === 400) {
          alert('There was an issue processing your payment: ' + (response.statusReason || 'Unknown error'));
        } else {
          alert('Unexpected response received. Please try again.');
        }
      },
      error: (error) => {
        console.error('Checkout error:', error);
        if (error.error) {
          console.error('API Error Response:', error.error);
        }
        alert('An error occurred during checkout. Please try again.');
      },
      complete: () => {
        console.log('Checkout process complete.');
        this.isLoading = false; // Reset the loading state
      },
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
