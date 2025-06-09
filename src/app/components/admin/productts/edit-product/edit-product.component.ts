import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../interfaces/product';
import { CategoriesService } from '../../../../../Services/categories.service';
import { ProductsService } from '../../../../../Services/products.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent implements OnInit {
  @Input() product!: Product;
  @Input() showModal: boolean = false;
  @Input() categories: string[] = [];
  @Output() modalClosed = new EventEmitter<void>();
  @Output() productUpdated = new EventEmitter<Product>();

  editForm!: FormGroup;

  constructor(private fb: FormBuilder, private categoryService: CategoriesService , private productService:ProductsService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.categoryService.GetAllCategoriesName().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Failed to fetch categories:', err);
      }
    });
  }


  initializeForm(): void {
    this.editForm = this.fb.group({
      title: [this.product.title, Validators.required],
      price: [this.product.price, [Validators.required, Validators.min(0.01)]],
      description: [this.product.description, Validators.required],
      category: [this.product.category, Validators.required],
      image: [this.product.image, Validators.required],
      ratingRate: [this.product.rating?.rate || 0],
      ratingCount: [this.product.rating?.count || 10]
    });
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  // onSubmit(): void {
  //   if (this.editForm.valid) {
  //     const updatedProduct: Product = {
  //       ...this.product,
  //       ...this.editForm.value,
  //       rating: {
  //         rate: this.editForm.value.ratingRate,
  //         count: this.editForm.value.ratingCount
  //       }
  //     };
  //     this.productUpdated.emit(updatedProduct);
  //     this.closeModal();
  //   }
  // }

  
  onSubmit(): void {
    if (this.editForm.valid) {
      const updatedProduct: Product = {
        ...this.product,
        ...this.editForm.value,
        rating: {
          rate: this.editForm.value.ratingRate,
          count: this.editForm.value.ratingCount
        }
      };

      this.productService.updateProduct(this.product.id, updatedProduct).subscribe({
        next: (response) => {
          this.productUpdated.emit(updatedProduct);
          // console.log(updatedProduct) // Success 
           Swal.fire({
            icon: 'success',
            title: 'Product updated successfully!',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-end'
          });
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update product:', err);
         
        }
      });
    }
  }

}
  
