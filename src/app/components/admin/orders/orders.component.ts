import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderHistoryService, Order, OrderStatus } from '../../../../Services/order-history.service';
import type { CartItem } from '../../../../Services/order-history.service';

interface DisplayCartItem extends CartItem {
  name: string;
  sku: string;
  image: string;
}

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    FormsModule, RouterModule, CommonModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  
  // Modal control
  isModalOpen: boolean = false;
  selectedOrder: Order | null = null;
  displayItems: DisplayCartItem[] = [];
  userProfile: UserProfile | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  constructor(private orderHistoryService: OrderHistoryService) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.isLoading = true;
    try {
      this.allOrders = this.orderHistoryService.getAllOrdersForAdmin();
      this.filteredOrders = [...this.allOrders];
      this.updatePagination();
    } catch (error) {
      console.error('Error loading orders:', error);
      this.allOrders = [];
      this.filteredOrders = [];
    } finally {
      this.isLoading = false;
    }
  }

getUserProfile(email: string): UserProfile | null {
  try {
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const users: any[] = JSON.parse(usersData);
      const user = users.find(u => u.email === email);
      if (!user) return null;

      const profile = user.profile || {};
      return {
        email: user.email,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: {
          street: profile.street || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zipCode || '',
          country: profile.country || '',
        }
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
  return null;
}


private enrichOrderWithUserData(order: Order): Order {
  const userProfile = this.getUserProfile(order.userEmail);
  if (!userProfile) return order;

  // Create a new shipping address object only if needed
  let shippingAddress = order.shippingAddress;
  
  if (!shippingAddress && userProfile.address) {
    shippingAddress = {
      street: userProfile.address.street || '',
      city: userProfile.address.city || '',
      state: userProfile.address.state || '',
      zipCode: userProfile.address.zipCode || '',
      country: userProfile.address.country || ''
    };
  }

  return {
    ...order,
    userFirstName: order.userFirstName || userProfile.firstName || '',
    userLastName: order.userLastName || userProfile.lastName || '',
    userPhone: order.userPhone || userProfile.phone || '',
    shippingAddress
  };
}

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.allOrders];
    } else {
      const term = this.searchTerm.trim().toLowerCase();
      this.filteredOrders = this.allOrders.filter(order => 
        (order.id && order.id.toLowerCase().includes(term)) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(term)) ||
        (order.date && order.date.toLowerCase().includes(term)) ||
        (order.status && order.status.toString().toLowerCase().includes(term)) ||
        (this.getCustomerName(order).toLowerCase().includes(term))
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch(status) {
      case OrderStatus.Delivered: return 'bg-success';
      case OrderStatus.Cancelled: return 'bg-danger';
      case OrderStatus.Shipped: return 'bg-info';
      case OrderStatus.OutForDelivery: return 'bg-warning';
      case OrderStatus.OrderPlaced: return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  showOrderDetails(order: Order): void {
    this.selectedOrder = this.enrichOrderWithUserData(order);
    this.userProfile = this.getUserProfile(order.userEmail);
    
    this.displayItems = order.items.map(item => ({
      ...item,
      name: item.title || item.name || `Product ${item.id}`,
      image: item.image || 'assets/default-product.png',
      sku: item.category ? `CAT-${item.category.toUpperCase()}` : `SKU-${item.id}`
    }));
    
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
    this.userProfile = null;
    document.body.style.overflow = '';
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredOrders.length / this.itemsPerPage));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  getCustomerName(order: Order): string {
    const userProfile = this.getUserProfile(order.userEmail);
    if (userProfile?.firstName || userProfile?.lastName) {
      return `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
    }
    if (order.userFirstName || order.userLastName) {
      return `${order.userFirstName || ''} ${order.userLastName || ''}`.trim();
    }
    return order.userEmail.split('@')[0];
  }

  getCustomerLocation(order: Order): string {
    if (order.shippingAddress?.city && order.shippingAddress?.country) {
      return `${order.shippingAddress.city}, ${order.shippingAddress.country}`;
    }
    
    const userProfile = this.getUserProfile(order.userEmail);
    if (userProfile?.address?.city && userProfile?.address?.country) {
      return `${userProfile.address.city}, ${userProfile.address.country}`;
    }
    
    return '-';
  }
}