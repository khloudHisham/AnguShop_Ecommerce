import { Component, Input, input, OnInit } from '@angular/core';
import { CategoriesService } from '../../../Services/categories.service';
import { CategoryFilterComponent } from "../category-filter/category-filter.component";
import { CommonModule } from '@angular/common';
import { OneProductComponent } from '../../components/one-product/one-product.component';
import { FormsModule } from '@angular/forms';

export interface Rating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
}

@Component({
  selector: 'app-category-master',
  imports: [CategoryFilterComponent , CommonModule , OneProductComponent , FormsModule],
  templateUrl: './category-master.component.html',
  styleUrl: './category-master.component.css'
})
export class CategoryMasterComponent implements OnInit{

  public CategoryProducts : Product[] = []
  public FilteredProducts : Product[] = []
  public currentPrice : Number = 1000
  public currentRate : Number = 0
  public selectedSort: string = 'priceAsc';
  public IsReset : Boolean = false;

  constructor(private CategoryService : CategoriesService) {}

  ngOnInit(): void {
    this.subscribeToCategory();
    this.subscribeToPrice();
    this.subscribeToRating();
    this.subscribeToIsReset();
  }
  
  subscribeToCategory(): void {
    this.CategoryService.selectedCategory$.subscribe({
      next: (category) => {
        if (category) {
          this.fetchCategoryProducts(category);
        }
      }
    });
  }
  
  fetchCategoryProducts(category: String): void {
    this.CategoryService.GetCategoryProducts(category).subscribe({
      next :(data : any) => {
        this.CategoryProducts = data;
        this.FilteredProducts = this.filterProducts(data);
        this.SortProducts();
      },
      error: (err) => console.log(err)
    });
  }
  
  subscribeToPrice(): void {
    this.CategoryService.selectedPrice$.subscribe({
      next: (price) => {
        this.currentPrice = price;
        if (this.CategoryProducts) 
        {
          this.FilteredProducts = this.filterProducts(this.CategoryProducts);
          this.SortProducts();
        }
      }
    });
  }

  subscribeToRating() : void
  {
    this.CategoryService.selectedRating$.subscribe({
      next : (rating) => 
      {
        this.currentRate = rating;
        if (this.CategoryProducts) 
          {
            this.FilteredProducts = this.filterProducts(this.CategoryProducts);
            this.SortProducts();
          }
      }
    })
  }
  
  subscribeToIsReset() :void
  {
    this.CategoryService.IsReset$.subscribe({
      next:(data) => 
      {
        this.IsReset = data
        if (this.IsReset) 
        {
          this.selectedSort = 'priceAsc';// Reset the sort value
          this.SortProducts();             
          this.IsReset = false;// Reset the flag
        }
      }
    })
  }

  filterProducts(products: any[]): any[] {
    return products.filter(p => p.price <= this.currentPrice && p.rating.rate >= this.currentRate);
  }
  SortProducts()
  {
      switch (this.selectedSort) 
      {
        case 'priceAsc':
          this.FilteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'priceDesc':
          this.FilteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'titleAsc':
          this.FilteredProducts.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'titleDesc':
          this.FilteredProducts.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'rating':
          this.FilteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
          break;
      }
  }


    scrollToTop() {
    const topElement = document.getElementById('top');
    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

