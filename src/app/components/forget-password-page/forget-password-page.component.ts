import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-forget-password-page',
  imports: [
    FormsModule, RouterModule, CommonModule
  ],
  templateUrl: './forget-password-page.component.html',
  styleUrl: './forget-password-page.component.css'
})
export class ForgetPasswordPageComponent {
  email = "";

  constructor(private router: Router) { }

  validateField(field: NgModel) {
    field.control.markAsTouched();
  }
}
