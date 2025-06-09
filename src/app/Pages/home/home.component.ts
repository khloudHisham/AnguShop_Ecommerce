import { Component, AfterViewInit, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { tns } from 'tiny-slider/src/tiny-slider';
import { ProductsComponent } from "../products/products.component";
import { CategoriesSliderComponent } from "../../components/categories-slider/categories-slider.component";
import { OneProductComponent } from "../../components/one-product/one-product.component";
import { HttpClient } from '@angular/common/http';
import { HeroComponent } from '../../components/hero/hero.component';


interface HeroProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  originalPrice?: number;
  discount?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductsComponent,
    CategoriesSliderComponent,
    OneProductComponent // Add this import
    ,
    HeroComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {
  // Add these properties for product filtering
  products: any[] = [];
  filteredProducts: any[] = [];
  activeFilter: string = 'best-rating';
dailyDeal: any = null;
hours: string = '00';
minutes: string = '00';
seconds: string = '00';
discountPercentage: number = 0;
private countdownInterval: any;
// In your HomeComponent class
heroProducts: HeroProduct[] = [];
selectedCategories = ['jewelery', "men's clothing", 'electronics', "women's clothing"];

  constructor(private http: HttpClient) {} // Add HttpClient

  ngOnInit() {
    this.loadProducts(); // Initialize product loading
    this.initDailyDeal();
  }

  // Add product loading method
  loadProducts() {
    this.http.get<any[]>('https://fakestoreapi.com/products').subscribe({
      next: (products) => {
        this.products = products.map(p => ({
          ...p,
          stock: Math.floor(Math.random() * 100) // Mock stock data
        }));
        this.applyFilter(this.activeFilter);
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  // Add filter method
  applyFilter(filterType: string) {
    this.activeFilter = filterType;
    
    switch(filterType) {
      case 'best-rating':
        this.filteredProducts = [...this.products]
          .sort((a, b) => b.rating.rate - a.rating.rate)
          .slice(0, 8);
        break;
        
      case 'high-price':
        this.filteredProducts = [...this.products]
          .sort((a, b) => b.price - a.price)
          .slice(0, 8);
        break;
        
      case 'in-stock':
        this.filteredProducts = this.products
          .filter(p => p.stock > 0)
          .slice(0, 8);
        break;
        
      default:
        this.filteredProducts = this.products.slice(0, 8);
    }
  }

  // Keep all your existing methods
  ngAfterViewInit(): void {
    // Preloader fadeout
    window.setTimeout(() => {
      const preloader = document.querySelector('.preloader') as HTMLElement;
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.display = 'none';
      }
    }, 500);

    // Tiny Slider: Hero
    tns({
      container: '.hero-slider',
      slideBy: 'page',
      autoplay: true,
      autoplayButtonOutput: false,
      mouseDrag: true,
      gutter: 0,
      items: 1,
      nav: false,
      controls: true,
      controlsText: [
        '<i class="fa-solid fa-chevron-left"></i>',
        '<i class="fa-solid fa-chevron-right"></i>'
      ]
    });

    // Tiny Slider: Brands Logo
    tns({
      container: '.brands-logo-carousel',
      autoplay: true,
      autoplayButtonOutput: false,
      mouseDrag: true,
      gutter: 15,
      nav: false,
      controls: false,
      responsive: {
        0: { items: 1 },
        540: { items: 3 },
        768: { items: 5 },
        992: { items: 6 }
      }
    });

    // Mobile menu toggle
    const navbarToggler = document.querySelector('.mobile-menu-btn');
    if (navbarToggler) {
      navbarToggler.addEventListener('click', () => {
        navbarToggler.classList.toggle('active');
      });
    }
  }

  scrollToTop() {
    const topElement = document.getElementById('top');
    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const headerNavbar = document.querySelector('.navbar-area') as HTMLElement;
    const backToTop = document.querySelector('.scroll-top') as HTMLElement;

    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      if (backToTop) backToTop.style.display = 'flex';
    } else {
      if (backToTop) backToTop.style.display = 'none';
    }
  }

  private initDailyDeal() {
  // Get a random product with at least 4-star rating
  this.http.get<any[]>('https://fakestoreapi.com/products').subscribe(products => {
    const eligibleProducts = products.filter(p => p.rating.rate >= 4);
    const randomIndex = Math.floor(Math.random() * eligibleProducts.length);
    this.dailyDeal = eligibleProducts[randomIndex];
    
    // Apply 20-40% discount
    this.discountPercentage = Math.floor(20 + Math.random() * 20);
    this.dailyDeal.originalPrice = this.dailyDeal.price;
    this.dailyDeal.price = parseFloat(
      (this.dailyDeal.price * (1 - this.discountPercentage/100)).toFixed(2)
    );
    
    // Start countdown (24 hours)
    this.startCountdown();
  });
}

private startCountdown() {
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 24);
  
  this.countdownInterval = setInterval(() => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      clearInterval(this.countdownInterval);
      this.initDailyDeal(); // Reset deal when time expires
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    this.hours = hours < 10 ? '0' + hours : hours.toString();
    this.minutes = minutes < 10 ? '0' + minutes : minutes.toString();
    this.seconds = seconds < 10 ? '0' + seconds : seconds.toString();
  }, 1000);
}

// Clean up interval
ngOnDestroy() {
  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
  }
}

}