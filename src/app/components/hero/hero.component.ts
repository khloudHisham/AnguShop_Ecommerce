import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule , RouterModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  slides = [
        {
      title: 'Angushop',
      description: 'Welcome to Angushop! We\'re thrilled to have you here. Explore our handpicked selection of products designed to bring joy to your everyday life.',
      image: 'Images/team/aboutus2.jpg' 
    },
    {
      title: 'Electronics',
      description: 'Discover cutting-edge gadgets and devices for your modern lifestyle. Shop the latest tech innovations today.',
      image: 'Images/hero/electronics.jpg' 
    },
    {
      title: 'Jewelry',
      description: 'Exquisite pieces that add elegance to every occasion. Find your perfect statement jewelry collection.',
      image: 'Images/hero/jewellery.jpg' 
    },
    {
      title: "Men's Clothing",
      description: 'Premium apparel combining style and comfort. Refresh your wardrobe with our quality menswear collection.',
      image: 'Images/hero/mens clothes.jpeg' 
    },
    {
      title: "Women's Clothing",
      description: 'Trend-setting fashion for every woman. Discover pieces that inspire confidence and beauty.',
      image: 'Images/hero/womens clothing.jpg' 
    }
  ];
  autoScrollInterval: any;

  ngOnInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    // Reset auto-scroll timer when user manually changes slide
    this.stopAutoScroll();
    this.startAutoScroll();
  }
}