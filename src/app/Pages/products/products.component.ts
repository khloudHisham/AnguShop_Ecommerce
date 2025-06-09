import { Component, OnInit } from '@angular/core';
import { OneProductComponent } from "../../components/one-product/one-product.component";
import { ProductsService } from '../../../Services/products.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [OneProductComponent, FormsModule, CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  currentPage: number = 1;
  pageSize: number = 9;
  AllProducts: any[] = [];
  searchText: string = '';
  selectedCategory: string = '';
  selectedSort: string = 'default';
  showAlert: boolean = false;
  viewMode: string = 'grid';
  loading: boolean = true;
  categories: string[] = [];

  constructor(private _prodService: ProductsService) { }

  ngOnInit(): void {
    this._prodService.getAllProducts().subscribe({
      next: (data) => {
        this.AllProducts = data as any[];
        this.categories = [...new Set(this.AllProducts.map(p => p.category))]; // extract unique categories
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });


  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts().length / this.pageSize);
  }

  paginatedProducts(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
    return this.filteredProducts().slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top of product list
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Optional smooth scroll
      });
    }
  }

  filteredProducts(): any[] {
    let filtered = this.AllProducts;

    if (this.searchText) {
      const lower = this.searchText.toLowerCase();
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(lower)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    switch (this.selectedSort) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating?.rate - a.rating?.rate);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }

  showNotification(): void {
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 3000);
  }

  scrollToTop() {
    const topElement = document.getElementById('top');
    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

