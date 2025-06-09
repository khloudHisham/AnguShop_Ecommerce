import { Component } from '@angular/core';
import { CategoriesService } from '../../../Services/categories.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-filter',
  imports: [FormsModule],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.css'
})
export class CategoryFilterComponent {
  public CategoryNames: any;
  public SelectedCategory : String = "";
  public SelectedPrice :Number = 1000;
  public SelectedRating :Number = 0;

    constructor(private CategoryService : CategoriesService) {}

    ngOnInit(): void 
    {
        this.CategoryService.GetAllCategoriesName().subscribe({
        next:(data) =>this.CategoryNames = data,
        error : (error)=> console.log(error)
      })
    }

    SetSelectedCategory(category: String) 
    {
      this.SelectedCategory = category
      this.CategoryService.setSelectedCategory(category); // Notify service about the selected category
    }
    ApplyFilter()
    {
      this.CategoryService.setSelectedPrice(+this.SelectedPrice); // Notify service about the selected price
      this.CategoryService.setSelectedRating(+this.SelectedRating); // Notify service about the selected price
    }
    ResetFilter()
    {
      this.CategoryService.setSelectedPrice(1000); // Notify service about the selected price
      this.CategoryService.setSelectedRating(0); // Notify service about the selected price
      this.CategoryService.SetIsReset(true); // Notify service that reset is doen
      this.SelectedPrice = 1000
      this.SelectedRating = 0
    }
}
