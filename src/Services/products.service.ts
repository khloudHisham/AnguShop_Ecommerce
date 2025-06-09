import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../app/interfaces/product';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly URL = "https://fakestoreapi.com/products";

  constructor(private myHttpClient: HttpClient) { }

getAllProducts() {
  return this.myHttpClient.get<Product[]>(this.URL).pipe(
    map((fetchedProducts: Product[]) => {
      const localProducts: Product[] = JSON.parse(localStorage.getItem('addedProducts') || '[]');
      return [...fetchedProducts, ...localProducts];
    })
  );
}

  getProductById(PId: number): Observable<Product> {
    return this.myHttpClient.get<Product>(`${this.URL}/${PId}`);
  }
  // services/products.service.ts
deleteProduct(id: number): Observable<any> {
  return this.myHttpClient.delete(`${this.URL}/${id}`);
}

updateProduct(id: number, ProductData:any ): Observable<any> {

  
  return this.myHttpClient.put(`${this.URL}/${id}`,ProductData);
}
 addNewProduct(product:any){
   const local = JSON.parse(localStorage.getItem('addedProducts') || '[]');
  local.push(product);
  localStorage.setItem('addedProducts', JSON.stringify(local));
    return this.myHttpClient.post(this.URL, product)
      // Also save locally for persistence
 
  }

}