import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

interface User {
  email: string;
  password: string;
  role?: 'customer' | 'admin';
  profile?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    location?: string;
    phone?: string;
    birthday?: string;
    image?: string;
  };
}

interface TokenPayload {
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly userKey = 'users';
  private readonly tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.initializeCurrentUser();
  }

  private initializeCurrentUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const payload: TokenPayload = JSON.parse(token);
        this.currentUserSubject.next(payload.email);
      } catch {
        this.clearToken();
      }
    }
  }

  // User data management
  private get users(): User[] {
    return JSON.parse(localStorage.getItem(this.userKey) || '[]');
  }

  private set users(users: User[]) {
    localStorage.setItem(this.userKey, JSON.stringify(users));
  }

  // Core authentication methods
  register(userData: {
    email: string;
    password: string;
    role?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      birthday?: string;
    }
  }, isAdmin: boolean = false): boolean {
    if (this.userExists(userData.email)) {
      return false;
    }

    const newUser: User = {
      email: userData.email,
      password: userData.password,
      role: isAdmin ? 'admin' : 'customer',
      profile: userData.profile || {}
    };

    this.users = [...this.users, newUser];
    return true;
  }

  login(email: string, password: string): boolean {
    if (!email || !password) return false;

    const user = this.users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
    );

    if (!user) return false;

    this.setToken({
      email: user.email,
      role: user.role
    });

    this.currentUserSubject.next(user.email);
    return true;
  }

  logout(): void {
    this.clearToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Token management
  private setToken(payload: TokenPayload): void {
    localStorage.setItem(this.tokenKey, JSON.stringify(payload));
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Helper methods
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isAdmin(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;

    try {
      const payload: TokenPayload = JSON.parse(token);
      return payload.role === 'admin';
    } catch {
      return false;
    }
  }

  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserProfile(): User | null {
    const email = this.currentUserSubject.value;
    return email ? this.users.find(u => u.email === email) || null : null;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  updateUserProfile(profileData: Partial<User['profile']>): boolean {
    const email = this.currentUserSubject.value;
    if (!email) return false;

    const users = this.users;
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return false;

    users[userIndex].profile = {
      ...users[userIndex].profile,
      ...profileData
    };
    this.users = users;
    return true;
  }

  updateUserProfileImage(email: string, imageUrl: string): boolean {
    const users = this.users;
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) return false;

    users[userIndex].profile = users[userIndex].profile || {};
    users[userIndex].profile!.image = imageUrl;
    this.users = users;
    return true;
  }

  makeAdmin(email: string): boolean {
    const users = this.users;
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) return false;

    users[userIndex].role = 'admin';
    this.users = users;
    return true;
  }

  private userExists(email: string): boolean {
    return this.users.some(user =>
      user.email.toLowerCase() === email.toLowerCase()
    );
  }

  deleteUser(email: string): boolean {
    const users = this.users;
    const initialLength = users.length;

    const updatedUsers = users.filter(user => user.email !== email);
    this.users = updatedUsers;

    return updatedUsers.length < initialLength;
  }

  getCurrentPassword(): string | null {
    const email = this.currentUserSubject.value;
    if (!email) return null;

    const user = this.users.find(u => u.email === email);
    return user ? user.password : null;
  }

  updatePassword(newPassword: string): boolean {
    const email = this.currentUserSubject.value;
    if (!email) return false;

    const users = this.users;
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) return false;

    users[userIndex].password = newPassword;
    this.users = users;
    return true;
  }

  setCurrentUser(user: User): void {
    const users = this.users;
    const userIndex = users.findIndex(u => u.email === user.email);

    if (userIndex > -1) {
      users[userIndex] = user;
      this.users = users;
    }
  }


  updateUser(email: string, updates: Partial<User>): boolean {
    const users = this.users;
    const index = users.findIndex(u => u.email === email);
    if (index === -1) return false;

    const currentUser = users[index];

    users[index] = {
      ...currentUser,
      ...updates,
      profile: {
        ...currentUser.profile,
        ...updates.profile
      }
    };

    this.users = users;
    return true;
  }
  // Add this method to your AuthenticationService
getUserImage(): string | null {
  // Get image from localStorage or user object
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  return user?.imageUrl || null;
}
}