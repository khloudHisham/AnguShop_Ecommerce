import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../../Services/wish-list.service';
import { CartService } from '../../../Services/cart.service';
import { Router } from '@angular/router';
import { OneProductComponent } from "../../components/one-product/one-product.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.css'],
  imports: [OneProductComponent, CommonModule,RouterModule]
})
export class WishListComponent implements OnInit {
  wishlistItems: any[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.wishlistItems = this.wishlistService.getWishlist();
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId);
    this.loadWishlist();
    this.showToast('Item removed from wishlist', 'warning');
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
    this.loadWishlist();
    this.showToast('Wishlist cleared', 'error');
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product);
    this.showToast('Added to cart', 'success');
  }

  viewDetails(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    // Simple console log fallback - you can implement a custom notification service
    console.log(`${type.toUpperCase()}: ${message}`);
    // In a real app, you might want to implement a custom notification component
  }
viewDetailsPage(): void {
  this.router.navigate(['/products']);
}

  
}