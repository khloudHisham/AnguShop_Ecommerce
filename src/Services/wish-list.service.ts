import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlist: any[] = [];
  private wishlistCount = new BehaviorSubject<number>(0);
  wishlistCount$ = this.wishlistCount.asObservable();

  constructor(private authService: AuthenticationService) {
    this.authService.currentUser$.subscribe(email => {
      this.loadWishlistFromLocalStorage(email);
    });
  }

  getWishlist(): any[] {
    return this.wishlist;
  }

  // Add this method to check if product is in wishlist
  isInWishlist(productId: number): boolean {
    return this.wishlist.some(item => item.id === productId);
  }

  addToWishlist(product: any): void {
    const exists = this.wishlist.find((item) => item.id === product.id);
    if (!exists) {
      this.wishlist.push(product);
      this.updateStorage();
    }
  }

  removeFromWishlist(productId: number): void {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.updateStorage();
  }
  
  clearWishlist(): void {
    this.wishlist = [];
    this.updateStorage();
  }

  private updateStorage() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      localStorage.setItem(currentUser + '-wishlist', JSON.stringify(this.wishlist));
      this.wishlistCount.next(this.wishlist.length);
    }
  }

  private loadWishlistFromLocalStorage(email: string | null): void {
    if (email) {
      const storedWishlist = localStorage.getItem(email + '-wishlist');
      this.wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
    } else {
      this.wishlist = [];
    }
    this.wishlistCount.next(this.wishlist.length);
  }
}