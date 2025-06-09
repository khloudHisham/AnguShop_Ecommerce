import { CommonModule } from '@angular/common';
import { WishlistService } from '../../../Services/wish-list.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartService } from '../../../Services/cart.service';
import { AuthenticationService } from '../../../Services/authentication.service';
import { Router, RouterModule } from '@angular/router';
import { ComparisonService } from '../../../Services/comparison.service';

@Component({
  selector: 'app-one-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './one-product.component.html',
  styleUrls: ['./one-product.component.css']
})
export class OneProductComponent {
  @Input() oneProductData: any;
  @Output() productAdded = new EventEmitter<void>();
  isAuthenticated: boolean = false;
  cartCount: number = 0;
  
  // Popup notification properties
  showPopup: boolean = false;
  popupMessage: string = '';
  popupType: 'success' | 'error' | 'wishlist' | 'cart' = 'success';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthenticationService,
    private comparisonService: ComparisonService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
  }

  // Check if product is in wishlist
  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.oneProductData.id);
  }

  // Check if product is in cart
  isInCart(): boolean {
    return this.cartService.isInCart(this.oneProductData.id);
  }

  // Show notification popup
  private showNotification(message: string, type: 'success' | 'error' | 'wishlist' | 'cart') {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    
    // Hide after 3 seconds
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }

  // Add/remove from wishlist
  addToWishlist() {
    if (this.isAuthenticated) {
      if (this.isInWishlist()) {
        this.wishlistService.removeFromWishlist(this.oneProductData.id);
        this.showNotification('Removed from wishlist', 'wishlist');
      } else {
        this.wishlistService.addToWishlist(this.oneProductData);
        this.showNotification('Added to wishlist', 'wishlist');
      }
    } else {
      this.showNotification('Please login to manage wishlist', 'error');
    }
  }

  // Get star ratings
  getStars(rate: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rate >= i) {
        stars.push('full');
      } else if (rate >= i - 0.5) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  // Add to cart
  addToCart(product: any): void {
    if (this.isAuthenticated) {
      if (this.isInCart()) {
        this.showNotification('Already in cart', 'cart');
      } else {
        this.cartService.addToCart(product);
        this.showNotification('Added to cart', 'cart');
      }
      this.productAdded.emit();
      this.cartService.getCartCount().subscribe(count => {
        this.cartCount = count;
      });
    } else {
      this.showNotification('Please login to add to cart', 'error');
    }
  }

  compareProduct() {
  this.comparisonService.addProductToCompare(this.oneProductData);
  this.router.navigate(['/compare']);
  this.showNotification('Added to comparison', 'success');
}
}