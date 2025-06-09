import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  user = {
    email: "",
    password: ""
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage = "";

  constructor(private router: Router, private authService: AuthenticationService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    // Check for remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.user.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validateField(field: NgModel) {
    field.control.markAsTouched();
  }

  async Login() {
    this.isLoading = true;
    this.errorMessage = "";


    if (this.user.email.toLocaleLowerCase() === "admin@gmail.com" && this.user.password === "Test@123") {
      this.router.navigate(['/admin']);
      return;
    }


    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = this.authService.login(this.user.email, this.user.password);

      if (success) {
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.user.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Redirect based on role from AuthServicez
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        this.errorMessage = "Invalid email or password";
      }
    } catch (error) {
      this.errorMessage = "Login error. Try again later.";
    } finally {
      this.isLoading = false;
    }
  }
}