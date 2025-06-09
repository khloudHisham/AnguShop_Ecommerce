import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from '../../../Services/authentication.service';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    FormsModule, RouterModule, CommonModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isSidebarCollapsed = false;
  isLoading: boolean = true;
  activeTab: string = 'dashboard';


  constructor(private router: Router , private authService: AuthenticationService ) {
    // Update active tab on navigation
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const urlSegments = event.urlAfterRedirects.split('/').filter(Boolean);

        // If only "admin" is present, default to "dashboard"
        if (urlSegments.length === 1 && urlSegments[0] === 'admin') {
          this.activeTab = 'dashboard';
        } else {
          this.activeTab = urlSegments[urlSegments.length - 1] || 'dashboard';
        }
      });
  }


  ngOnInit(): void {
    // Simulate loading delay (replace with real async logic if needed)
    setTimeout(() => {
      this.isLoading = false;
    }, 750);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.router.navigate(['/admin', tab]);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  getHeaderIcon(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'fas fa-tachometer-alt';
      case 'users': return 'fas fa-users';
      case 'products': return 'fas fa-boxes';
      case 'orders': return 'fas fa-shopping-cart';
      case 'complaints': return 'fa-solid fa-comments';
      case 'settings': return 'fa-solid fa-gear';
      default: return 'fas fa-circle';
    }
  }

  // isActive(path: string): boolean {
  //   return this.router.url.includes(path);
  // }

logout(): void {
  this.authService.logout();
  // Use replaceUrl to prevent going back
  this.router.navigate(['/login'], { replaceUrl: true });
}
}