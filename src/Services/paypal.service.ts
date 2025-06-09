import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare const paypal: any;

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private paymentErrorSubject = new BehaviorSubject<string | null>(null);
  private paymentSuccessSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    // Load PayPal SDK
    this.loadPayPalScript();
  }

  getIsLoading(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  getPaymentError(): Observable<string | null> {
    return this.paymentErrorSubject.asObservable();
  }

  getPaymentSuccess(): Observable<boolean> {
    return this.paymentSuccessSubject.asObservable();
  }

  private loadPayPalScript(): void {
    if (typeof document === 'undefined') {
      return; // Skip during SSR
    }

    // Check if script is already loaded
    if (window.hasOwnProperty('paypal')) {
      return;
    }

    this.isLoadingSubject.next(true);
    
    const script = document.createElement('script');
    // Use USD as it's widely supported
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD&debug=true';
    script.async = true;
    
    script.onload = () => {
      this.isLoadingSubject.next(false);
      console.log('PayPal SDK loaded successfully');
    };
    
    script.onerror = () => {
      this.isLoadingSubject.next(false);
      this.paymentErrorSubject.next('Failed to load PayPal SDK');
      console.error('Failed to load PayPal SDK');
    };
    
    document.body.appendChild(script);
  }

  renderPayPalButtons(containerId: string, amount: number, orderData: any): Promise<void> {
    this.paymentErrorSubject.next(null);
    this.isLoadingSubject.next(true);
    
    return new Promise<void>((resolve, reject) => {
      if (typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded');
        this.paymentErrorSubject.next('PayPal SDK not loaded');
        this.isLoadingSubject.next(false);
        reject('PayPal SDK not loaded');
        return;
      }
      
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('PayPal container not found');
        this.paymentErrorSubject.next('PayPal container not found');
        this.isLoadingSubject.next(false);
        reject('PayPal container not found');
        return;
      }
      
      // Clear existing buttons
      container.innerHTML = '';
      
      try {
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          },
          
          createOrder: (data: any, actions: any) => {
            console.log('Creating order with amount:', amount);
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toFixed(2),
                  currency_code: 'USD' // Using USD as it's widely supported
                }
              }]
            });
          },
          
          onApprove: (data: any, actions: any) => {
            console.log('Payment approved, capturing order...');
            return actions.order.capture().then((details: any) => {
              console.log('Payment successful, details:', details);
              this.isLoadingSubject.next(false);
              this.paymentSuccessSubject.next(true);
              
              // Emit an event that the payment was successful
              const paymentSuccessEvent = new CustomEvent('paypal-payment-success', {
                detail: {
                  orderId: data.orderID,
                  details: details
                }
              });
              window.dispatchEvent(paymentSuccessEvent);
            });
          },
          
          onError: (err: any) => {
            console.error('PayPal error:', err);
            this.paymentErrorSubject.next('Payment failed. Please try again.');
            this.isLoadingSubject.next(false);
            reject(err);
          },
          
          onCancel: (data: any) => {
            console.log('Payment cancelled by user');
            this.isLoadingSubject.next(false);
          }
          
        }).render('#' + containerId).then(() => {
          console.log('PayPal buttons rendered successfully');
          this.isLoadingSubject.next(false);
          resolve();
        }).catch((error: any) => {
          console.error('Error rendering PayPal buttons:', error);
          this.paymentErrorSubject.next('Failed to load payment options');
          this.isLoadingSubject.next(false);
          reject(error);
        });
      } catch (error) {
        console.error('Error setting up PayPal buttons:', error);
        this.paymentErrorSubject.next('Failed to set up payment options');
        this.isLoadingSubject.next(false);
        reject(error);
      }
    });
  }
}