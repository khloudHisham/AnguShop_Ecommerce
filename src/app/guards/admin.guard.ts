// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../../Services/authentication.service';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthenticationService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAdmin()) {
      return true;
    } else {
      this.router.navigate(['/']); // or to '/access-denied'
      return false;
    }
  }
}