import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../Services/products.service';
import { WishlistService } from '../../../Services/wish-list.service';
import { CartService } from '../../../Services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swiper from 'swiper';
import { OneProductComponent } from "../../components/one-product/one-product.component";

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, OneProductComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {
  Prdid: number;
  UserDetailsData: any;
  quantity: number = 1;
  addedToCart: boolean = false;
  addedToWish: boolean = false;
  isInCart: boolean = false;
  isInWishlist: boolean = false;
  relatedProducts: any[] = [];
  private swiper!: Swiper;

  // Reviews data
  reviews: any[] = [];
  newReview: any = {
    author: '',
    rating: 0,
    text: '',
    date: new Date()
  };

  constructor(
    private wishlistService: WishlistService,
    private MyActivated: ActivatedRoute,
    private _productService: ProductsService,
    private _cartService: CartService
  ) {
    this.Prdid = Number(MyActivated.snapshot.params["id"]);
  }

  ngOnInit(): void {
    this._productService.getProductById(this.Prdid).subscribe({
      next: (data) => {
        this.UserDetailsData = data;
        this.checkCartStatus();
        this.checkWishlistStatus();
        this.loadReviews();
        this.loadRelatedProducts(data.category);
      },
      error: (error) => console.log(error)
    });
  }

  ngAfterViewInit(): void {
    this.initSwiper();
  }

  initSwiper(): void {
    this.swiper = new Swiper('.related-products-swiper', {
      // modules: [Autoplay],
      loop: true, // Enable infinite loop
      autoplay: {
        delay: 3000, // Auto-scroll every 3 seconds
        disableOnInteraction: false, // Continue autoplay after user interaction
      },
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        576: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        992: { slidesPerView: 3 }
      }
    });
  }

  loadRelatedProducts(category: string): void {
    this._productService.getAllProducts().subscribe({
      next: (products: any[]) => {
        // Filter by category and exclude current product
        this.relatedProducts = products.filter(
          (p: any) => p.category === category && p.id !== this.Prdid
        );
        // Update Swiper if initialized
        if (this.swiper) {
          setTimeout(() => {
            this.swiper.update();
          }, 0);
        }
      },
      error: (error: any) => console.error('Error loading related products', error)
    });
  }

  checkCartStatus(): void {
    this.isInCart = this._cartService.isInCart(this.UserDetailsData.id);
  }

  checkWishlistStatus(): void {
    this.isInWishlist = this.wishlistService.isInWishlist(this.UserDetailsData.id);
  }

  toggleCart(): void {
    if (this.isInCart) {
      this._cartService.removeFromCart(this.UserDetailsData.id);
    } else {
      const productToAdd = {
        ...this.UserDetailsData,
        quantity: this.quantity
      };
      this._cartService.addToCart(productToAdd);
      this.addedToCart = true;
      setTimeout(() => {
        this.addedToCart = false;
      }, 2000);
    }
    this.isInCart = !this.isInCart;
  }

  toggleWishlist(): void {
    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.UserDetailsData.id);
    } else {
      this.wishlistService.addToWishlist(this.UserDetailsData);
      this.addedToWish = true;
      setTimeout(() => {
        this.addedToWish = false;
      }, 2000);
    }
    this.isInWishlist = !this.isInWishlist;
  }

  // Load reviews from localStorage
  loadReviews(): void {
    const storedReviews = localStorage.getItem(`product_${this.Prdid}_reviews`);
    if (storedReviews) {
      this.reviews = JSON.parse(storedReviews);
    } else {
      // Default reviews if none exist
      this.reviews = [
        {
          author: 'John Doe',
          rating: 4,
          text: 'Great product! Works exactly as described. Very happy with my purchase.',
          date: new Date('2023-05-15')
        },
        {
          author: 'Jane Smith',
          rating: 5,
          text: 'Absolutely love it! Exceeded my expectations. Would definitely buy again.',
          date: new Date('2023-06-20')
        }
      ];
      this.saveReviews();
    }
  }

  // Save reviews to localStorage
  saveReviews(): void {
    localStorage.setItem(`product_${this.Prdid}_reviews`, JSON.stringify(this.reviews));
  }

  incrementQuantity(): void {
    this.quantity++;
    this.updateQuantity(this.quantity);
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateQuantity(this.quantity);
    }
  }

  updateQuantity(value: number): void {
    this.quantity = Math.max(value, 1);
  }

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

  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  submitReview(): void {
    if (this.newReview.author && this.newReview.text && this.newReview.rating > 0) {
      this.newReview.date = new Date();
      this.reviews.unshift({...this.newReview});
      this.saveReviews();
      
      // Reset form
      this.newReview = {
        author: '',
        rating: 0,
        text: '',
        date: new Date()
      };
    }
  }
}