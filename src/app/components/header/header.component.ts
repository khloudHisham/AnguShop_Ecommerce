import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { WishlistService } from '../../../Services/wish-list.service';
import { CartService } from '../../../Services/cart.service';
import { AuthenticationService } from '../../../Services/authentication.service';
import { UserService } from '../../../Services/user.service';
import { CommonModule } from '@angular/common';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  userName: string | null = null;
  userImage: string = "/Images/Angu_Shop1.png";
  wishlistCount: number = 0;
  cartCount: number = 0;

  constructor(
    private router: Router,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthenticationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Handle cart and wishlist counts
    combineLatest([
      this.cartService.getCartCount(),
      this.wishlistService.wishlistCount$
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([cartCount, wishlistCount]) => {
        this.cartCount = cartCount;
        this.wishlistCount = wishlistCount;
      });

    // Load initial user data
    this.loadUserData();

    // Subscribe to authentication changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUserData());

    // Subscribe to image updates
    this.userService.getUserImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(image => {
        this.userImage = image || "/Images/Angu_Shop1.png";;
      });
  }

  private loadUserData(): void {
    const currentUserEmail = this.authService.getCurrentUser();
    if (currentUserEmail) {
      this.userName = currentUserEmail;
      this.userService.loadCurrentUserImage();
    } else {
      this.userName = null;
      this.userImage = "/Images/Angu_Shop1.png";
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}