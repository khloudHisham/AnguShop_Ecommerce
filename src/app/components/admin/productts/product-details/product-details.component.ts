import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../interfaces/product'; 

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  @Input() product!: Product;
  @Input() showModal: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<number>();

  closeModal(): void {
    this.modalClosed.emit();
  }

  onEdit(): void {
    this.editRequested.emit(this.product.id);
    this.closeModal();
  }
}