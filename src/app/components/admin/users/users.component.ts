import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../../Services/authentication.service';

interface TableUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  role: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: TableUser[] = [];

  paginatedUsers: TableUser[] = [];
  newUser = {
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    password: '',
    role: 'customer' as 'customer' | 'admin'
  };

  editUser: TableUser = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    role: 'customer'
  };
  showEditModal = false;
  editFormErrors: { [key: string]: string } = {};

  // Modal controls
  showDetailsModal = false;
  selectedUser: TableUser | null = null;
  showModal = false;
  formSubmitted = false;
  formErrors: { [key: string]: string } = {};
  showPasswordField = true;
  showDeleteModal = false;

  // Pagination controls
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  searchTerm: string = '';
  isSearchActive: boolean = false;
  filteredUsers: TableUser[] = [];
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const authUsers = this.authService.getAllUsers();

    this.users = authUsers.map((user, index) => {
      const profile = user.profile || {};
      return {
        id: index + 1,
        name: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user.email,
        email: user.email,
        phone: profile.phone || 'N/A',
        birthdate: profile.birthday || 'N/A',
        role: user.role || 'customer'
      };
    });

    this.applyFilter();
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const sourceData = this.isSearchActive ? this.filteredUsers : this.users;
    this.paginatedUsers = sourceData.slice(startIndex, startIndex + this.itemsPerPage);
  }


  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const maxVisible = 5;

    if (total <= 1) return [1];

    pages.push(1);

    let start = Math.max(2, this.currentPage - 2);
    let end = Math.min(total - 1, this.currentPage + 2);

    if (this.currentPage <= 3) {
      end = Math.min(5, total - 1);
    } else if (this.currentPage >= total - 2) {
      start = Math.max(total - 4, 2);
    }

    if (start > 2) pages.push(-1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < total - 1) pages.push(-1);

    if (total > 1) pages.push(total);

    return pages;
  }

  openAddUserModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newUser = {
      name: '',
      email: '',
      phone: '',
      birthdate: '',
      password: '',
      role: 'customer'
    };
    this.formSubmitted = false;
    this.formErrors = {};
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.newUser.name.trim()) {
      this.formErrors['name'] = 'Name is required';
      isValid = false;
    }

    if (!this.newUser.email.trim()) {
      this.formErrors['email'] = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      this.formErrors['email'] = 'Please enter a valid email';
      isValid = false;
    }

    if (this.showPasswordField && !this.newUser.password.trim()) {
      this.formErrors['password'] = 'Password is required';
      isValid = false;
    }

    return isValid;
  }

  addUser(form: NgForm) {
    this.formSubmitted = true;

    if (!this.validateForm()) {
      return;
    }

    const [firstName, ...lastNameParts] = this.newUser.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const userData = {
      email: this.newUser.email,
      password: this.newUser.password,
      role: this.newUser.role,
      profile: {
        firstName: firstName,
        lastName: lastName,
        phone: this.newUser.phone,
        birthday: this.newUser.birthdate
      }
    };

    const registrationSuccess = this.authService.register(userData, this.newUser.role === 'admin');

    if (!registrationSuccess) {
      this.formErrors['email'] = 'Email already exists';
      return;
    }

    this.loadUsers();
    this.closeModal();
  }

  openDetailsModal(user: TableUser) {
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.selectedUser = null;
    this.showDetailsModal = false;
  }
  applyFilter() {
    this.isSearchActive = this.searchTerm.trim().length > 0;

    if (!this.isSearchActive) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    }

    this.totalItems = this.filteredUsers.length;
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  openDeleteModal(user: TableUser) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.selectedUser) return;

    // Delete from authentication service
    const success = this.authService.deleteUser(this.selectedUser.email);

    if (success) {
      // Reload users
      this.loadUsers();
      // Close both modals
      this.closeDeleteModal();
      this.closeDetailsModal();
    } else {
      // Handle error (you might want to show an error message)
      console.error('Failed to delete user');
    }
  }


  openEditModal(user: TableUser) {
    this.editUser = { ...user }; // Shallow copy
    this.editFormErrors = {};
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editFormErrors = {};
  }

  validateEditForm(): boolean {
    this.editFormErrors = {};
    let isValid = true;

    if (!this.editUser.name.trim()) {
      this.editFormErrors['name'] = 'Name is required';
      isValid = false;
    }

    if (!this.editUser.email.trim()) {
      this.editFormErrors['email'] = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editUser.email)) {
      this.editFormErrors['email'] = 'Please enter a valid email';
      isValid = false;
    }

    return isValid;
  }

  updateUser(form: NgForm) {
    if (!this.validateEditForm()) return;

    const updated = this.authService.updateUser(this.editUser.email, {
      profile: {
        firstName: this.editUser.name.split(' ')[0],
        lastName: this.editUser.name.split(' ').slice(1).join(' '),
        phone: this.editUser.phone,
        birthday: this.editUser.birthdate
      },
      role: this.editUser.role as 'customer' | 'admin'
    });

    if (!updated) {
      this.editFormErrors['email'] = 'Failed to update user';
      return;
    }

    this.loadUsers();
    this.closeEditModal();
  }
}