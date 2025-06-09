import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../Services/cart.service';
import { PaypalService } from '../../../Services/paypal.service';
import { AuthenticationService } from '../../../Services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  isLoading: boolean = false;
  paymentError: string | null = null;
  paymentSuccess: boolean = false;
  paypalButtonsRendered: boolean = false;
  promoCode: string = '';
  promoDiscount: number = 0;
  
  private subscriptions: Subscription[] = [];
  private paymentSuccessListener: any;
  
  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private paypalService: PaypalService,
    private authService: AuthenticationService, // Added AuthenticationService
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadCartItems();
    this.loadUserProfile(); // Added method to load user profile
    this.subscribeToPayPalState();
    
    // Listen for successful PayPal payments
    this.paymentSuccessListener = (event: any) => {
      this.completeOrder(event.detail.orderId, event.detail.details);
    };
    
    window.addEventListener('paypal-payment-success', this.paymentSuccessListener);
  }
  
  ngAfterViewInit(): void {
    // We'll render PayPal buttons after the view is initialized
    setTimeout(() => {
      if (this.cartTotal > 0) {
        this.renderPayPalButtons();
      }
    }, 500);
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Remove event listener
    window.removeEventListener('paypal-payment-success', this.paymentSuccessListener);
  }
  
  private initForm(): void {
    this.checkoutForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      address2: [''],
      country: ['EG', [Validators.required]], // Default to Egypt
      state: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      paymentMethod: ['paypal', [Validators.required]]
    });
  }
  
  // New method to load user profile data
  private loadUserProfile(): void {
    const user = this.authService.getCurrentUserProfile();
    
    if (user) {
      // Update form with user profile data
      this.checkoutForm.patchValue({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        username: user.profile?.username || user.email.split('@')[0],
        email: user.email || '',
        // If you have address information in the profile, you can add it here
        // address: user.profile?.address || '',
        // country: user.profile?.country || 'EG',
        // state: user.profile?.state || '',
        // zip: user.profile?.zip || ''
      });
      
      // If you have phone number in the profile and want to use it
      // You might need to add a phone field to your form if it's not already there
      // this.checkoutForm.addControl('phone', this.formBuilder.control(user.profile?.phone || ''));
      
      console.log('User profile loaded into checkout form:', user.profile);
    }
  }
  
  private loadCartItems(): void {
    const cartSub = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });
    this.subscriptions.push(cartSub);
    
    const totalSub = this.cartService.getCartTotal().subscribe(total => {
      this.cartTotal = total;
    });
    this.subscriptions.push(totalSub);
  }
  
  private subscribeToPayPalState(): void {
    const loadingSub = this.paypalService.getIsLoading().subscribe(loading => {
      this.isLoading = loading;
    });
    this.subscriptions.push(loadingSub);
    
    const errorSub = this.paypalService.getPaymentError().subscribe(error => {
      this.paymentError = error;
    });
    this.subscriptions.push(errorSub);
    
    const successSub = this.paypalService.getPaymentSuccess().subscribe(success => {
      this.paymentSuccess = success;
    });
    this.subscriptions.push(successSub);
  }
  
  private renderPayPalButtons(): void {
    if (this.paypalButtonsRendered || this.cartTotal <= 0) {
      return;
    }

    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) {
      console.error('PayPal button container not found');
      this.paymentError = 'Payment form could not be loaded. Please refresh and try again.';
      return;
    }

    // Prepare order data from the form
    const orderData = {
      items: this.cartItems.map(item => ({
        name: item.title,
        quantity: item.quantity,
        unit_amount: {
          currency_code: 'USD', // Changed to USD for better compatibility
          value: item.price.toString()
        }
      })),
      customer: this.checkoutForm.value
    };

    this.paypalService.renderPayPalButtons('paypal-button-container', this.getFinalTotal(), orderData)
      .then(() => {
        this.paypalButtonsRendered = true;
      })
      .catch(error => {
        console.error('Error rendering PayPal buttons:', error);
        this.paymentError = 'Failed to load payment options. Please refresh and try again.';
      });
  }
  
  onFormSubmit(): void {
    if (this.checkoutForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    // Update the PayPal buttons with the latest form data
    this.renderPayPalButtons();
    
    // Scroll to the PayPal buttons
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
      paypalContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  completeOrder(orderId: string, details: any): void {
    const orderData = {
      items: this.cartItems,
      total: this.getFinalTotal(),
      customer: this.checkoutForm.value,
      paymentDetails: {
        provider: 'paypal',
        orderId: orderId,
        details: details
      }
    };
    
    // Here you would typically send the order to your backend
    console.log('Order completed:', orderData);
    
    // Clear the cart and redirect to success page
    this.cartService.clearCart();
    this.paymentSuccess = true;
    
    setTimeout(() => {
      this.router.navigate(['/order-success']);
    }, 2000);
  }
  
  handlePromoSubmit(event: Event): void {
    event.preventDefault();
    
    if (this.promoCode === 'EXAMPLECODE') {
      this.promoDiscount = 10; // Example discount of 10 EGP
    } else {
      this.promoDiscount = 0;
    }
    
    // Re-render PayPal buttons with updated total
    if (this.paypalButtonsRendered) {
      this.paypalButtonsRendered = false;
      this.renderPayPalButtons();
    }
  }
  
  getPromoDiscount(): number {
    return this.promoDiscount;
  }
  
  getFinalTotal(): number {
    return this.cartTotal - this.getPromoDiscount();
  }
  
  // Helper to identify form field errors
  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.invalid && (field?.dirty || field?.touched)) {
      if (field?.errors?.['required']) {
        return 'This field is required';
      }
      if (field?.errors?.['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  
}