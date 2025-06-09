import { Injectable } from '@angular/core';
// import { CartItem } from './cart.service';
import { AuthenticationService } from './authentication.service';


// In order-history.service.ts
import { CartItem } from './cart.service';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userFirstName?: string;
  userLastName?: string;
  userPhone?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
   paymentStatus?: string;
  date: string;
  status: OrderStatus;
  totalAmount: number;
  items: CartItem[];
}


export enum OrderStatus {
  OrderPlaced = 'Order Placed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  OutForDelivery = 'Out for Delivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}
@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private orders: Order[] = [];
  
  constructor(private authService: AuthenticationService) {
    this.loadOrders();
  }

  // Add a new order from checkout items
  addOrder(checkoutItems: CartItem[]): Order {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to place an order');
    }

    const newOrder: Order = {
      id: this.generateOrderId(),
      date: new Date().toLocaleDateString(),
      status: OrderStatus.OrderPlaced,
      items: [...checkoutItems],
      totalAmount: this.calculateTotal(checkoutItems),
      userEmail: currentUser,
      userId: ''
    };
    
    this.orders.unshift(newOrder);
    this.saveToLocalStorage();
    return newOrder;
  }

  // Get all orders for current user (sorted by newest first)
  getOrders(): Order[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return this.orders
      .filter(order => order.userEmail === currentUser)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get a specific order by ID (only if belongs to current user)
  getOrder(orderId: string): Order | undefined {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return undefined;
    
    return this.orders.find(order => 
      order.id === orderId && order.userEmail === currentUser
    );
  }

  // Update order status (only if belongs to current user)
  updateOrderStatus(orderId: string, newStatus: OrderStatus): boolean {
    const order = this.getOrder(orderId);
    if (order) {
      order.status = newStatus;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  // Cancel an order (only if belongs to current user)
  cancelOrder(orderId: string): boolean {
    return this.updateOrderStatus(orderId, OrderStatus.Cancelled);
  }

  // Helper methods
  private generateOrderId(): string {
    return `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`;
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private loadOrders(): void {
    const savedOrders = localStorage.getItem('orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : [];
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }
  // In OrderHistoryService class
getAllOrdersForAdmin(): Order[] {
  return [...this.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
}

export type { CartItem };
