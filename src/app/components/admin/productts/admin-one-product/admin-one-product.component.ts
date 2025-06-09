// admin-one-product.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass, SlicePipe } from '@angular/common';
import { Product } from '../../../../interfaces/product';
import { ProductsService } from '../../../../../Services/products.service';
import { ProductDetailsComponent } from '../../productts/product-details/product-details.component';
import { EditProductComponent } from "../../productts/edit-product/edit-product.component";


@Component({
  selector: 'app-admin-one-product',
  standalone: true,
  imports: [CommonModule, NgClass, SlicePipe, ProductDetailsComponent, EditProductComponent],
  templateUrl: './admin-one-product.component.html',
  styleUrls: ['./admin-one-product.component.css']
})
export class AdminOneProductComponent {
  @Input() product!: Product;
  @Input() categories: string[] = []; // Add categories input
  showDetailsModal = false;
  showEditModal = false; // Add edit modal flag

  constructor(private productService: ProductsService) { }

  @Output() delete = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<number>();
  @Output() edit = new EventEmitter<Product>(); // Change to emit Product instead of number


  onDelete(): void {
    const confirmed = confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    const localProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
    const index = localProducts.findIndex((p: any) => p.id === this.product.id);

    if (index !== -1) {
      localProducts.splice(index, 1);
      localStorage.setItem('addedProducts', JSON.stringify(localProducts));
    }

    this.delete.emit(this.product.id);
  }


  onView(): void {
    this.showDetailsModal = true;
    this.viewDetails.emit(this.product.id);
  }

  onEdit(): void {
    this.showEditModal = true; // Show edit modal instead of emitting immediately
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  handleProductUpdate(updatedProduct: Product): void {
    this.edit.emit(updatedProduct); // Emit the updated product
    this.closeEditModal();
  }

  handleEditRequest(): void {
    this.closeDetailsModal();
    this.onEdit(); // This will now show the edit modal
  }
}