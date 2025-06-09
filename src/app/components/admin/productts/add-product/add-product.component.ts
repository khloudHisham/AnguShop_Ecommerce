import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../../Services/products.service';
import { CategoriesService } from '../../../../../Services/categories.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  @Input() showModal: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() productAdded = new EventEmitter<void>(); // Emit when product is successfully added

  productForm: FormGroup;
  categories: string[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  stockCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private productService: ProductsService,
    private categoryService: CategoriesService
  ) {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      image: ['', [
        Validators.required,
        // Validators.pattern(/^(http|https):\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)
        // Validators.pattern(
        //   '\\b(?:https?|ftp|file|data):\\/\\/[^\\s<>"]+|www\\.[^\\s<>"]+')
        Validators.pattern('')
      ]],
      stockCount: [this.stockCount, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.categoryService.GetAllCategoriesName().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Failed to fetch categories:', err);
        this.errorMessage = 'Failed to load categories. Please try again later.';
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      this.productService.addNewProduct(this.productForm.value).subscribe({
        next: (res) => {
          console.log("Product added:", res);
          this.isLoading = false;
          this.productAdded.emit(); // Notify parent component
          this.closeModal();
          this.resetForm();
        },
        error: (err) => {
          console.error('Failed to add product:', err);
          this.isLoading = false;
          this.errorMessage = 'Failed to add product. Please check your inputs and try again.';
        }
      });
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  resetForm(): void {
    this.productForm.reset({
      title: '',
      price: 0,
      description: '',
      category: '',
      image: ''
    });
  }

  // Helper method to easily access form controls in the template
  get f() {
    return this.productForm.controls;
  }
}