import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserImage$ = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthenticationService) {}

  getUserImage(): Observable<string | null> {
    return this.currentUserImage$.asObservable();
  }

  updateUserImage(newImage: string): void {
    const email = this.authService.getCurrentUser();
    if (!email) return;

    const users = this.authService.getAllUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].profile = users[userIndex].profile || {};
      users[userIndex].profile!.image = newImage;
      localStorage.setItem('users', JSON.stringify(users));
      this.currentUserImage$.next(newImage);
    }
  }

  loadCurrentUserImage(): void {
    const email = this.authService.getCurrentUser();
    if (!email) {
      this.currentUserImage$.next(null);
      return;
    }

    const user = this.authService.getAllUsers().find(u => u.email === email);
    this.currentUserImage$.next(user?.profile?.image || null);
  }
}