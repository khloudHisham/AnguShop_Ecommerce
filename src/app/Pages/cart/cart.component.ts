import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../../Services/cart.service';
import { Router, RouterModule } from '@angular/router';
import { OrderHistoryService } from '../../../Services/order-history.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  uniqueItemCount: number = 0;  // Number of unique products
  totalQuantity: number = 0;    // Sum of all quantities
  isLoading: boolean = true;

  // Modal control flags
  showClearCartModal: boolean = false;
  showEmptyCartModal: boolean = false;
  showCheckoutModal: boolean = false;

  constructor(private cartService: CartService, private router: Router , private OrderHistory : OrderHistoryService) {}

  ngOnInit(): void {
    this.loadCartData();
  }

  private loadCartData(): void {
    this.isLoading = true;
    
    // Subscribe to cart items
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateLocalTotals();
      },
      error: (err) => {
        console.error('Error loading cart items:', err);
        this.isLoading = false;
      }
    });

    // Subscribe to unique item count
    this.cartService.getCartCount().subscribe({
      next: (count) => {
        this.uniqueItemCount = count;
      },
      error: (err) => {
        console.error('Error loading cart count:', err);
      }
    });

    // Subscribe to total quantity
    this.cartService.getCartTotalQuantity().subscribe({
      next: (quantity) => {
        this.totalQuantity = quantity;
      },
      error: (err) => {
        console.error('Error loading total quantity:', err);
      }
    });

    // Subscribe to cart total
    this.cartService.getCartTotal().subscribe({
      next: (total) => {
        this.cartTotal = total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading cart total:', err);
        this.isLoading = false;
      }
    });
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: number, newQuantity: number): void {
    const item = this.cartItems.find(i => i.id === productId);
    
    if (item) {
      // Prevent quantity from going below 1
      newQuantity = Math.max(1, newQuantity);
      
      // Optimistic UI update
      item.quantity = newQuantity;
      this.calculateLocalTotals();
      
      // Update through service
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  private calculateLocalTotals(): void {
    // Calculate local totals for immediate UI feedback
    this.cartTotal = this.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    this.totalQuantity = this.cartItems.reduce(
      (count, item) => count + item.quantity, 
      0
    );
    this.uniqueItemCount = this.cartItems.length;
  }

  clearCart(): void {
    this.showClearCartModal = true;
  }

  confirmClearCart(): void {
    this.isLoading = true;
    this.cartService.clearCart();
    this.closeModal();
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      this.showEmptyCartModal = true;
      return;
    }
    this.showCheckoutModal = true;
       // console.log('Checkout items:', this.cartItems); 3shan e7na m3fneen m3nash floss fe paypal ❌🤙
    this.OrderHistory.addOrder(this.cartItems);  
  }

  navigateToCheckout(): void {
    this.closeModal();
    this.router.navigate(['/checkout']);
  }

  closeModal(): void {
    this.showClearCartModal = false;
    this.showEmptyCartModal = false;
    this.showCheckoutModal = false;
  }

}
