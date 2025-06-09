import { Component, AfterViewInit, OnInit } from '@angular/core';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-categories-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories-slider.component.html',
  styleUrls: ['./categories-slider.component.css']
})
export class CategoriesSliderComponent implements OnInit, AfterViewInit {
  categories: any[] = [];
  isLoading = true;
  private swiper: Swiper | undefined;
  
  // Custom category data with images
  categoryData = [
    {
      name: 'Electronics',
      image: '/img/electronics.jpg',
      slug: 'electronics'
    },
    {
      name: 'Jewelry',
      image: '/img/jewellery.jpg',
      slug: 'jewelery'
    },
    {
      name: "Men's Clothing",
      image: '/img/mens clothes.jpeg',
      slug: "men's clothing"
    },
    {
      name: "Women's Clothing",
      image: '/img/women clothing.jpg',
      slug: "women's clothing"
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.http.get<string[]>('https://fakestoreapi.com/products/categories')
      .subscribe({
        next: (categoryNames) => {
          // Duplicate categories for smoother looping
          const baseCategories = categoryNames.map((name, index) => ({
            name: this.formatCategoryName(name),
            slug: name,
            image: this.categoryData[index]?.image || '/img/category-default.jpg'
          }));
          
          this.categories = [...baseCategories, ...baseCategories, ...baseCategories];
          this.isLoading = false;
          
          // Initialize Swiper after slight delay
          setTimeout(() => this.initSwiper(), 50);
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
          const baseCategories = this.categoryData;
          this.categories = [...baseCategories, ...baseCategories, ...baseCategories];
          this.isLoading = false;
          setTimeout(() => this.initSwiper(), 50);
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.categories.length > 0) {
      this.initSwiper();
    }
  }

  private formatCategoryName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private initSwiper(): void {
    if (this.swiper) {
      this.swiper.destroy();
    }

    this.swiper = new Swiper('.categories__container', {
      slidesPerView: 'auto',
      spaceBetween: 24,
      loop: true,
      loopAdditionalSlides: 4, // Add extra slides for smoother looping
      grabCursor: true,
      centeredSlides: false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        350: {
          slidesPerView: 1.5,
          spaceBetween: 16
        },
        576: {
          slidesPerView: 2
        },
        768: {
          slidesPerView: 3
        },
        992: {
          slidesPerView: 4
        }
      }
    });
  }
}