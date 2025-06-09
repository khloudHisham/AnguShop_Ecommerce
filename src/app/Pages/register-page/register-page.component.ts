import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {
  user = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  showModal = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';

  constructor(private router: Router, private authService: AuthenticationService) { }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      this.passwordFieldType = this.showPassword ? 'text' : 'password';
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
      this.confirmPasswordFieldType = this.showConfirmPassword ? 'text' : 'password';
    }
  }

  async Register() {
    // Reset error message
    this.errorMessage = '';
    
    // Validate passwords match
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Validate password length
    if (this.user.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;

    try {
 
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = this.authService.register({
        email: this.user.email,
        password: this.user.password
      });

      if (success) {
        this.showModal = true;
      } else {
        this.errorMessage = 'This email is already registered. Please try another email or login.';
      }
    } catch (error) {
      this.errorMessage = 'Registration failed. Please try again later.';
      console.error('Registration error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  redirectToLogin() {
    this.router.navigate(['/login'], {
      state: { 
        registeredEmail: this.user.email,
        justRegistered: true 
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }
}