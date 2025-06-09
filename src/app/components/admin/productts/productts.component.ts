import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../../interfaces/product';
import { ProductsService } from '../../../../Services/products.service';
import { AdminOneProductComponent } from './admin-one-product/admin-one-product.component';
import { AddProductComponent } from './add-product/add-product.component';


@Component({
  selector: 'app-productts',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    AdminOneProductComponent,
    AddProductComponent
  ],
  templateUrl: './productts.component.html',
  styleUrls: ['./productts.component.css']
})
export class ProducttsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  searchText = '';
  currentPage = 1;
  pageSize = 12;
  showAddProductModal = false;

  constructor(private productService: ProductsService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: data => {
        this.products = data;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to fetch products', err);
        this.loading = false;
      }
    });
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p =>
      p.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  onDeleteProduct(id: number): void {
    // if (confirm('Are you sure you want to delete this product?')) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
      },
      error: err => {
        console.error('Failed to delete product', err);
      }
    });
    // }

    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }

  onViewProduct(id: number): void {
    console.log('View product details:', id);
  }

  onEditProduct(id: number): void {
    console.log('Edit product:', id);
  }

  openAddProductModal(): void {
    this.showAddProductModal = true;
  }

  closeAddProductModal(): void {
    this.showAddProductModal = false;
  }

  handleProductAdded(): void {
    this.closeAddProductModal();
    this.loadProducts(); // Refresh the product list
  }

  // Reserved for future use with child events
  handleDelete(productId: number) { }
  handleUpdate(updatedProduct: Product) {

    const index = this.products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
    }
    this.products[index] = { ...updatedProduct };
  }
}