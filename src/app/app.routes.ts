import { Routes } from '@angular/router';
import { MainLayoutComponent } from './Layout/main-layout/main-layout.component';
import { RegisterPageComponent } from './Pages/register-page/register-page.component';
import { LoginPageComponent } from './Pages/login-page/login-page.component';
import { ForgetPasswordPageComponent } from './components/forget-password-page/forget-password-page.component';


import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { UsersComponent } from './components/admin/users/users.component';
import { ProducttsComponent } from './components/admin/productts/productts.component';
import { OrdersComponent } from './components/admin/orders/orders.component';
import { ComplaintsComponent } from './components/admin/complaints/complaints.component';
import { SettingsComponent } from './components/admin/settings/settings.component';


import { ProductsComponent } from './Pages/products/products.component';

import { ErrorPageComponent } from './Pages/error-page/error-page.component';
import { HomeComponent } from './Pages/home/home.component';
import { AboutComponent } from './Pages/about/about.component';
import { CartComponent } from './Pages/cart/cart.component';
import { ProductDetailsComponent } from './Pages/product-details/product-details.component';
import { CheckoutComponent } from './Pages/checkout/checkout.component';
import { WishListComponent } from './Pages/wish-list/wish-list.component';
import { CategoryMasterComponent } from './Pages/category-master/category-master.component';
import { ProfileComponent } from './Pages/profile/profile.component';
import { AboutUsComponent } from './Pages/about-us/about-us.component';
import { OrderHistoryComponent } from './Pages/order-history/order-history.component';
import { CompareProductComponent } from './Pages/compare-product/compare-product.component';
import { AddProductComponent } from './components/admin/productts/add-product/add-product.component'; 

export const routes: Routes = [
  // Standalone pages (without layout  Navbar and Footer)
  { path: 'register', component: RegisterPageComponent, title: 'Register' },
  { path: 'login', component: LoginPageComponent, title: 'Login' },
  { path: 'forgetpass', component: ForgetPasswordPageComponent, title: 'Forget Password' },


  {
    path: 'admin', component: AdminComponent, title: "Admin Dashboard",
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'products', component: ProducttsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'complaints', component: ComplaintsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'add-product', component: AddProductComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },


  // Pages under layout ythat will appear with Navbar and Footer
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, title: 'Home' },

      { path: 'OrderHistory', component: OrderHistoryComponent, title: 'Order History' },
      { path: 'contactus', component: AboutComponent, title: 'Contact Us' },
      { path: 'cart', component: CartComponent, title: 'Cart' },
      { path: 'products', component: ProductsComponent, title: 'Our Products' },
      { path: 'products/:id', component: ProductDetailsComponent, title: 'Product Details' },
      { path: 'Categories', component: CategoryMasterComponent, title: 'Categories' },
      { path: 'checkout', component: CheckoutComponent, title: 'Checkout' },
      { path: 'wishList', component: WishListComponent, title: 'wishList' },
      { path: 'error', component: ErrorPageComponent, title: 'Error' },
      { path: 'profile', component: ProfileComponent, title: 'Login' },
      { path: 'compare', component: CompareProductComponent, title: 'Compare Products' },
      { path: 'about', component: AboutUsComponent, title: 'About Us' }

    ]
  },

  // Other standalone components or error handling
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'error', title: 'Error' }
];
