import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { BusinessCartService } from '../../services/business-cart/business-cart.service';
import { DeleteCartService } from '../../services/delete-cart/delete-cart.service';
import { GetAddressService } from '../../../users/services/get-address/get-address.service';
import { AddAddressService } from '../../../users/services/add-address/add-address.service';
import { DeleteAddressService } from '../../../users/services/delete-address/delete-address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// import { CheckoutComponent } from '../checkout/checkout.component';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

export interface Address {
  add_id: number; // ✅ Add this property to match API response
  fullName: string;
  email: string;
  contact: string;
  billingAddress: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  addressType: string;
}

@Component({
    imports: [CommonModule, FormsModule, NgbTypeahead], //,CheckoutComponent],
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  // Define the type for cartItems, adding cartId and discountedPrice as optional fields
  cartItems: Array<{
    cartId: string; // Add cartId for deletion
    productId: string;
    upc: string;
    name: string;
    quantity: number;
    price: number;
    discountedPrice?: number; // Added field to store discounted price
    image: string;
    imageError: boolean;
    discounts_Seller?: Array<{
      id: number;
      product_id: number;
      quantity: number;
      amount: number;
      percentage: number | null;
      customer_type: string;
    }>; // Optional discounts_Seller array to handle products without discounts
  }> = [];

  // Then in your component, update the savedAddresses definition
  savedAddresses: Address[] = []; // Properly typed array
  // selectedAddress: Address | null = null;
  showAddressForm = false; // Controls visibility of the form

  showSuccessPopup = false;

  usStates: string[] = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  // Update newAddress to match the interface
  newAddress: Address = {
    add_id: 0,
    fullName: '',
    email: '',
    contact: '',
    billingAddress: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'United States',
    addressType: 'Shipping', // ✅ Default value set here
  };

  formSubmitted = false;

  businessId: number | null = null;

  searchTerm: string = '';

  toastMessage: string = ''; 

  billing = {
    fullName: '',
    email: '',
    contact: '',
    billingAddress: '',
    country: 'United States',
    state: '',
    city: '',
    zipcode: '',
  };

  private _selectedAddress: Address | null = null;

  get selectedAddress(): Address | null {
    return this._selectedAddress;
  }

  set selectedAddress(address: Address | null) {
    this._selectedAddress = address;
    if (address) {
      this.billing = {
        fullName: address.fullName,
        email: address.email,
        contact: address.contact,
        billingAddress: address.billingAddress,
        country: address.country,
        state: address.state,
        city: address.city,
        zipcode: address.zipcode,
      };
    }
  }

  constructor(
    private cartService: CartService,
    private businessCartService: BusinessCartService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private deleteCartService: DeleteCartService,
    private getAddressService: GetAddressService,
    private addAddressService: AddAddressService,
    private deleteAddressService: DeleteAddressService
  ) {}

  ngOnInit(): void {
    this.businessId = this.cartService.getUserID()
      ? +this.cartService.getUserID()!
      : null;

    if (this.businessId !== null) {
      this.loadCartData(); // Fetch cart data if businessId is available
    } else {
      console.error('Business ID (userID) is not set.');
    }

    this.loadSavedAddresses();
  }

  filteredCartItems() {
    if (!this.searchTerm) return this.cartItems;
    return this.cartItems.filter((item) =>
      item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  isBillingFormValid(): boolean {
    return !!(
      this.billing.fullName?.trim() &&
      this.billing.email?.trim() &&
      this.billing.contact?.trim() &&
      this.billing.billingAddress?.trim() &&
      this.billing.city?.trim() &&
      this.billing.state?.trim() &&
      this.billing.zipcode?.trim() &&
      this.billing.country?.trim()
    );
  }

  /** Mobile detector (used by *ngIf in template) */
  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  /** Flat shipping fee (or whatever logic you prefer) */
  shippingCost: number = 9.99;

  /** Sum of all per‑item discounts */
  totalDiscount(): number {
    return this.cartItems.reduce((sum, item) => {
      const full = item.price * item.quantity;
      const disc = item.discountedPrice ?? full;
      return sum + (full - disc);
    }, 0);
  }



  handleNewAddressPaste(event: ClipboardEvent): void {
    event.preventDefault(); // Prevent default paste action

    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    // Extract structured data
    const addressParts = this.extractBillingDetails(pastedText);

    // Auto-fill fields in New Address Form if found
    if (addressParts.fullName) this.newAddress.fullName = addressParts.fullName;
    if (addressParts.billingAddress)
      this.newAddress.billingAddress = addressParts.billingAddress;
    if (addressParts.city) this.newAddress.city = addressParts.city;
    if (addressParts.state) this.newAddress.state = addressParts.state;
    if (addressParts.zipcode) this.newAddress.zipcode = addressParts.zipcode;
    if (addressParts.country) this.newAddress.country = addressParts.country;
    if (addressParts.contact) this.newAddress.contact = addressParts.contact;
    if (addressParts.email) this.newAddress.email = addressParts.email;
  }

  handleBillingPaste(event: ClipboardEvent): void {
    event.preventDefault(); // Prevent default paste action

    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    // Extract structured data
    const addressParts = this.extractBillingDetails(pastedText);

    // Auto-fill fields if found
    if (addressParts.fullName) this.billing.fullName = addressParts.fullName;
    if (addressParts.billingAddress)
      this.billing.billingAddress = addressParts.billingAddress;
    if (addressParts.city) this.billing.city = addressParts.city;
    if (addressParts.state) this.billing.state = addressParts.state;
    if (addressParts.zipcode) this.billing.zipcode = addressParts.zipcode;
    if (addressParts.country) this.billing.country = addressParts.country;
    if (addressParts.contact) this.billing.contact = addressParts.contact;
    if (addressParts.email) this.billing.email = addressParts.email;
  }

  extractBillingDetails(addressText: string): {
    fullName?: string;
    billingAddress?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
    contact?: string;
    email?: string;
  } {
    const result: {
      fullName?: string;
      billingAddress?: string;
      city?: string;
      state?: string;
      zipcode?: string;
      country?: string;
      contact?: string;
      email?: string;
    } = {};

    let lines = addressText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    // Extract full name (first line)
    if (lines.length > 0) {
      result.fullName = lines[0];
    }

    // Extract phone number
    const phoneRegex = /\+?\d{1,2}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/;
    const phoneMatch = lines.find((line) => phoneRegex.test(line));
    if (phoneMatch) {
      result.contact = phoneMatch.match(phoneRegex)?.[0] ?? '';
      lines = lines.filter((line) => line !== phoneMatch); // Remove phone number
    }

    // Extract email address
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = lines.find((line) => emailRegex.test(line));
    if (emailMatch) {
      result.email = emailMatch.match(emailRegex)?.[0] ?? '';
      lines = lines.filter((line) => line !== emailMatch); // Remove email
    }

    // Extract ZIP code, state, and city
    const zipStateCityRegex = /^(.*)\s([A-Z]{2})\s(\d{5}(-\d{4})?)$/;
    const stateZipLineIndex = lines.findIndex((line) =>
      zipStateCityRegex.test(line)
    );

    if (stateZipLineIndex !== -1) {
      const match = lines[stateZipLineIndex].match(zipStateCityRegex);
      if (match) {
        result.city = match[1].trim();
        result.state = match[2].trim();
        result.zipcode = match[3].trim();
      }
      lines.splice(stateZipLineIndex, 1); // Remove extracted line
    }

    // Remove "United States" (or any case variation)
    lines = lines.filter(
      (line) => !line.toLowerCase().includes('united states')
    );

    // Remove empty lines after filtering
    lines = lines.filter((line) => line.trim() !== '');

    // Extract billing address (remaining lines after removing extracted fields)
    result.billingAddress = lines.slice(1).join(', ');

    // Set default country
    result.country = 'United States';

    return result;
  }

  deleteAddress(address: Address): void {
    if (
      confirm(
        `Are you sure you want to delete this address: ${address.fullName}?`
      )
    ) {
      console.log(`Deleting address with ID: ${address.add_id}`);

      this.deleteAddressService.deleteAddress(address.add_id).subscribe({
        next: () => {
          this.savedAddresses = this.savedAddresses.filter(
            (a) => a.add_id !== address.add_id
          );
          console.log('Address deleted successfully.');
        },
        error: (err) => console.error('Error deleting address:', err),
      });
    }
  }

  loadSavedAddresses(): void {
    const customerId = this.cartService.getUserID();

    if (customerId) {
      this.getAddressService.getAddresses(+customerId).subscribe({
        next: (response) => {
          console.log('Full API Response:', response);

          if (response.success && Array.isArray(response.data)) {
            this.savedAddresses = response.data.map((addr: any) => ({
              add_id: addr.add_id,
              fullName: addr.fullName,
              email: addr.email,
              contact: addr.phoneNumber,
              billingAddress: addr.streetAddressLine1,
              city: addr.city,
              state: addr.state,
              zipcode: addr.zipCode,
              country: addr.country,
              addressType: addr.addressType ?? 'Unknown', // ✅ Ensures `addressType` never becomes undefined
            }));

            console.log(
              'Mapped Addresses After API Call:',
              this.savedAddresses
            );

            setTimeout(() => {
              this.cdr.detectChanges(); // ✅ Force UI update
            }, 0);
          } else {
            console.error('API returned unexpected format:', response);
            this.savedAddresses = [];
          }
        },
        error: (error) => {
          console.error('Error fetching addresses:', error);
          this.savedAddresses = [];
        },
      });
    }
  }

  // Toggle form visibility
  toggleAddressForm(): void {
    this.showAddressForm = !this.showAddressForm;

    // Reset form when opening
    if (this.showAddressForm) {
      this.newAddress = {
        add_id: 0,
        fullName: '',
        email: '',
        contact: '',
        billingAddress: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'United States',
        addressType: '', // ✅ Include addressType
      };
    }
  }

  saveNewAddress(): void {
    this.formSubmitted = true;
    if (
      !this.newAddress.fullName ||
      !this.newAddress.email ||
      !this.newAddress.contact ||
      !this.newAddress.billingAddress ||
      !this.newAddress.city ||
      !this.newAddress.state ||
      !this.newAddress.zipcode ||
      !this.newAddress.country
    ) {
      console.error('Missing required fields.');
      return;
    }

    const customerId = this.cartService.getUserID();
    if (!customerId) {
      console.error('No customer ID found.');
      return;
    }

    const addressData = {
      customerId: +customerId,
      fullName: this.newAddress.fullName,
      streetAddressLine1: this.newAddress.billingAddress,
      streetAddressLine2: '',
      city: this.newAddress.city,
      state: this.newAddress.state,
      zipCode: this.newAddress.zipcode,
      country: this.newAddress.country,
      phoneNumber: this.newAddress.contact,
      email: this.newAddress.email,
      latitude: 0,
      longitude: 0,
      addressType: this.newAddress.addressType,
      isPrimary: true,
    };

    this.addAddressService.addAddress(addressData).subscribe({
      next: (response) => {
        if (response.success) {
          if (!Array.isArray(this.savedAddresses)) {
            console.error('savedAddresses is not an array. Resetting...');
            this.savedAddresses = [];
          }
          this.savedAddresses.push({ ...this.newAddress });
          this.showSuccessPopup = true; // ✅ Show success pop-up
          this.toggleAddressForm();
        } else {
          console.error('API Error: ', response);
          alert('Failed to add address. Please try again.');
        }
      },
      error: (error) => {
        console.error('Server error while adding address:', error);
        alert('Server error while adding address. Please try later.');
      },
    });
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
  }

  searchStates = (text$: Observable<string>): Observable<string[]> =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) =>
        term.length < 1
          ? []
          : this.usStates
              .filter((state) =>
                state.toLowerCase().startsWith(term.toLowerCase())
              )
              .slice(0, 10)
      )
    );

  handleAddressPaste(event: ClipboardEvent): void {
    event.preventDefault(); // Prevent default paste action

    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    // Set the pasted text to the billing address field
    this.billing.billingAddress = pastedText;

    // Extract address details using a regex or keywords
    const addressParts = this.extractAddressDetails(pastedText);

    // Auto-fill city, state, and zip code if found
    if (addressParts.city) {
      this.billing.city = addressParts.city;
    }
    if (addressParts.state) {
      this.billing.state = addressParts.state;
    }
    if (addressParts.zipcode) {
      this.billing.zipcode = addressParts.zipcode;
    }
  }

  // Function to extract city, state, and zip code from pasted text
  extractAddressDetails(address: string): {
    city?: string;
    state?: string;
    zipcode?: string;
  } {
    const result: { city?: string; state?: string; zipcode?: string } = {};

    // Regex patterns to detect ZIP code, state abbreviations, and city names
    const zipRegex = /\b\d{5}(-\d{4})?\b/; // Matches US ZIP codes (12345 or 12345-6789)
    const stateRegex =
      /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/;
    const addressParts = address.split(',');

    // Extract ZIP code
    const zipMatch = address.match(zipRegex);
    if (zipMatch) {
      result.zipcode = zipMatch[0];
    }

    // Extract state
    const stateMatch = address.match(stateRegex);
    if (stateMatch) {
      result.state = stateMatch[0];
    }

    // Extract city (assuming it appears **before** the state)
    if (stateMatch) {
      const stateIndex = addressParts.findIndex((part) =>
        part.includes(stateMatch[0])
      );

      if (stateIndex > 0) {
        // The city is usually the part **right before the state**
        result.city = addressParts[stateIndex - 1].trim();
      }
    }

    return result;
  }

  calculateSubtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + this.getItemTotal(item),
      0
    );
  }

  getItemTotal(item: {
    productId: string;
    price: number;
    quantity: number;
    discountedPrice?: number;
    discounts_Seller?: any[];
  }): number {
    const customerType = 'Bronze'; // Adjust customer type as needed
    const discountedPrice = this.applyDiscount(
      item,
      item.quantity,
      customerType
    );
    item.discountedPrice = discountedPrice; // Store discounted price in item
    return discountedPrice;
  }

  // Fetch the cart data from the server
  loadCartData(): void {
    if (!this.businessId) {
      // console.error('Business ID is not available.');
      return;
    }
    this.businessCartService
      .getCartDetailsByBusinessId(this.businessId)
      .subscribe(
        (data) => {
          // console.log('Fetched cart details:', data);
          this.cartItems = data.map((item: any) => ({
            cartId: item.cart_id, // Include cartId for each item
            productId: item.product.product_id.toString(),
            name: item.product.product_name,
            quantity: item.prod_qty,
            price: item.product.product_price,
            image: item.product.product_image,
            upc: item.product.product_identifier2,
            imageError: false,
            discounts_Seller: item.product.discounts_Seller || [], // Include discounts if available
          }));
          // Log all cart items after loading
          console.log('Loaded cart items:', this.cartItems);
          // Update each item with its discounted price
          this.cartItems.forEach((item) => this.getItemTotal(item));
        },
        (error) => {
          console.error('Error fetching cart details:', error);
        }
      );
  }

  // Remove a product from the cart using the cartId
removeFromCart(cartId: string): void {
  Swal.fire({
    title: 'Remove item from cart',
    text: 'This product will no longer appear in your cart.',
    icon: 'warning', // You can also use 'question' or 'info' if preferred
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Remove',
    cancelButtonText: 'Keep it',
    reverseButtons: true,
    backdrop: true,
    focusCancel: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.deleteCartService.deleteCart(+cartId).subscribe(
        (response) => {
          if (response.success) {
            this.cartItems = this.cartItems.filter(item => item.cartId !== cartId);
            Swal.fire({
              icon: 'success',
              title: 'Item removed',
              text: 'The product was removed from your cart.',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Removal failed',
              text: response.statusReason || 'Could not remove the item.',
            });
          }
        },
        (error) => {
          console.error('Delete error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            text: 'Unable to remove the item. Please try again.',
          });
        }
      );
    }
  });
}


  applyDiscount(product: any, prod_qty: number, customerType: string): number {
    // console.log('applyDiscount called with: Product:', product, 'Quantity:', prod_qty, 'Customer Type:', customerType);
    if (!product.discounts_Seller || product.discounts_Seller.length === 0) {
      return product.price * prod_qty; // Return original price if no discounts available
    }

    const discounts = product.discounts_Seller.filter(
      (d: any) => d.customer_type === customerType
    );
    if (discounts.length === 0) {
      return product.price * prod_qty; // No discount applicable for this customer type
    }

    discounts.sort((a: any, b: any) => a.quantity - b.quantity);

    let applicableDiscountAmount = 0;

    for (let i = 0; i < discounts.length; i++) {
      const discount = discounts[i];
      const nextDiscountTier =
        i + 1 < discounts.length ? discounts[i + 1].quantity : Infinity;

      if (prod_qty <= discount.quantity) {
        applicableDiscountAmount = discount.amount;
        break;
      }

      if (prod_qty > discount.quantity && prod_qty < nextDiscountTier) {
        applicableDiscountAmount = discount.amount;
      }
    }

    const originalTotal = product.price * prod_qty;
    const discountedTotal = originalTotal - applicableDiscountAmount * prod_qty;

    return discountedTotal;
  }

  handleImageError(item: any): void {
    console.log('Image failed to load:', item.image);
    item.imageError = true;
    item.image = '/assets/images/placeholder.png';
  }

  onQuantityInput(productId: string, event: any): void {
    const updatedQuantity = Math.max(+event.target.value, 1); // Ensure quantity is at least 1
    this.updateQuantity(productId, updatedQuantity);
  }

  updateQuantity(productId: string, newQuantity: number): void {
    newQuantity = Math.max(newQuantity, 1); // Prevent negative or zero quantities
    if (newQuantity > 0) {
      this.cartService.updateQuantity(productId, newQuantity);

      const itemToUpdate = this.cartItems.find(
        (item) => item.productId === productId
      );
      if (itemToUpdate) {
        itemToUpdate.quantity = newQuantity;
        itemToUpdate.discountedPrice = this.applyDiscount(
          itemToUpdate,
          newQuantity,
          'Bronze'
        ); // Update discounted price
      }

      this.cdr.detectChanges(); // Trigger change detection manually if needed
    }
  }

  saveBillingDetails(): void {
    console.log('Billing details saved:', this.billing);
    this.cartService.saveBillingDetails(this.billing);
    localStorage.setItem('billingDetails', JSON.stringify(this.billing));
  }

  goToCheckout(): void {
    // Save billing details before navigating to checkout
    this.saveBillingDetails();
    console.log(
      'Billing details saved before going to checkout:',
      this.billing
    );

    // Save cart items to localStorage
    const cartItemsToSave = this.cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      upc: item.upc,
      quantity: item.quantity,
      price: item.price,
      discountedPrice: item.discountedPrice || item.price, // Include discounted price or original if no discount
      image: item.image,
    }));

    // Log cart items to be saved
    // console.log('Cart Items before saving to storage:', cartItemsToSave);

    localStorage.setItem('cartItems', JSON.stringify(cartItemsToSave));

    // Navigate to the CheckoutComponent
    this.router.navigate(['/B2B/cart/checkout']);
  }
}
