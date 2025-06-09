import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private selectedCategory = new BehaviorSubject<String>("electronics");  // holds latest category
  selectedCategory$ = this.selectedCategory.asObservable();    // other components can listen to it

  private selectedPrice = new BehaviorSubject<Number>(1000);  // holds the selected price
  selectedPrice$ = this.selectedPrice.asObservable();    // other components can listen to it

  private selectedRating = new BehaviorSubject<Number>(0);  // holds the selected rating
  selectedRating$ = this.selectedRating.asObservable();    // other components can listen to it

  private IsReset = new BehaviorSubject<Boolean>(false);  // holds the selected rating
  IsReset$ = this.IsReset.asObservable();    // other components can listen to it

  constructor(private Http : HttpClient ){}
  private readonly URL = "https://fakestoreapi.com/products/categories"
  GetAllCategoriesName()
  {
    return this.Http.get<string[]>(this.URL);
  }

  GetCategoryProducts(category :String)
  {
    return this.Http.get(`https://fakestoreapi.com/products/category/${category}`);
  }

  setSelectedCategory(category: String) 
  {
    this.selectedCategory.next(category);  // this will notify all listeners
  }

  setSelectedPrice(price: number) 
  {
    this.selectedPrice.next(price);  // this will notify all listeners
  }

  setSelectedRating(Rating: number) 
  {
    this.selectedRating.next(Rating);  // this will notify all listeners
  }

  SetIsReset( Isreset : Boolean)
  {
    this.IsReset.next(Isreset); // this will notify all listeners
  }

}
