import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../app/interfaces/product';


@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private comparisonProducts = new BehaviorSubject<Product[]>([]);
  currentComparisonProducts = this.comparisonProducts.asObservable();

  addProductToCompare(product: Product) {
    const currentProducts = this.comparisonProducts.value;
    if (currentProducts.length < 2 && !currentProducts.some(p => p.id === product.id)) {
      this.comparisonProducts.next([...currentProducts, product]);
    }
  }

  getComparisonProducts(): Product[] {
    return this.comparisonProducts.value;
  }

  clearComparison() {
    this.comparisonProducts.next([]);
  }
  removeFromComparison(productId: number) {
  const currentProducts = this.comparisonProducts.value;
  this.comparisonProducts.next(currentProducts.filter(p => p.id !== productId));
}
}