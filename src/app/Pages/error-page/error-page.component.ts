import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-error-page',
  imports: [],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css'
})
export class ErrorPageComponent {
  errorCode = '404';
  errorTitle = 'Page Not Found';
  errorMessage = 'The page you requested could not be found.';

  constructor(private router: Router, private route: ActivatedRoute) {
    // Get error details from route data if provided
    this.route.data.subscribe(data => {
      if (data['errorCode']) this.errorCode = data['errorCode'];
      if (data['errorTitle']) this.errorTitle = data['errorTitle'];
      if (data['errorMessage']) this.errorMessage = data['errorMessage'];
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  reloadPage() {
    window.location.reload();
  }
}