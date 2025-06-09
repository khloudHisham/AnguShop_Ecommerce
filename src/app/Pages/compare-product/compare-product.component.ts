import { Component } from '@angular/core';
import { ComparisonService } from '../../../Services/comparison.service';
import { ProductsService } from '../../../Services/products.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interfaces/product';


@Component({
  selector: 'app-compare-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './compare-product.component.html',
  styleUrls: ['./compare-product.component.css']
})
export class CompareProductComponent {
  productsToCompare: Product[] = [];
  maxCompareItems = 3; // Set maximum comparison items

  constructor(
    private comparisonService: ComparisonService,
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productsToCompare = this.comparisonService.getComparisonProducts();
  }

  // Add this method to generate star ratings
  getStars(rate: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push('full');
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  canAddMoreProducts(): boolean {
    return this.productsToCompare.length < this.maxCompareItems;
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  removeProduct(productId: number) {
    this.comparisonService.removeFromComparison(productId);
    this.productsToCompare = this.comparisonService.getComparisonProducts();
  }

  clearComparison() {
    this.comparisonService.clearComparison();
    this.productsToCompare = [];
  }
}