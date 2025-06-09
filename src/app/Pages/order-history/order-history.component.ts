import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderHistoryService, Order, OrderStatus } from '../../../Services/order-history.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  public orders: Order[] = [];
  public Status = OrderStatus;
  private intervalId: any;

  constructor(private orderHistory: OrderHistoryService) {
    this.orders = orderHistory.getOrders();
  }

  ngOnInit(): void {
    // Auto-update order statuses every 5 seconds (5000ms)
    this.intervalId = setInterval(() => {
      this.autoUpdateOrderStatuses();
    }, 5000);
  }

  ngOnDestroy(): void {
    // Clear interval when component is destroyed to prevent memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Auto-update all non-cancelled and non-delivered orders
  private autoUpdateOrderStatuses(): void {
    this.orders.forEach(order => {
      // Only update orders that are not cancelled or delivered
      if (order.status !== OrderStatus.Cancelled && order.status !== OrderStatus.Delivered) {
        this.updateSingleOrderStatus(order);
      }
    });
    this.orders = this.orderHistory.getOrders(); // Refresh view
  }

  // Update a single order's status
  private updateSingleOrderStatus(order: Order): void {
    const statusValues = Object.values(OrderStatus);
    const currentIndex = statusValues.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statusValues.length;
    
    // Skip cancelled status in automatic progression
    const nextStatus = statusValues[nextIndex] === OrderStatus.Cancelled 
      ? statusValues[(nextIndex + 1) % statusValues.length]
      : statusValues[nextIndex];

    this.orderHistory.updateOrderStatus(order.id, nextStatus);
  }

  cancelOrder(orderId: string): void {
    this.orderHistory.cancelOrder(orderId);
    this.orders = this.orderHistory.getOrders();
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.OrderPlaced;
  }

  getStatusBadgeClass(status: OrderStatus): any {
    return {
      'bg-success-subtle text-success': status !== OrderStatus.Cancelled,
      'bg-danger-subtle text-danger': status === OrderStatus.Cancelled,
      'bg-info-subtle text-info': status === OrderStatus.Shipped,
      'bg-warning-subtle text-warning': status === OrderStatus.OutForDelivery
    };
  }
getProgressWidth(status: OrderStatus): string {
  switch(status) {
    case OrderStatus.OrderPlaced:
      return '5%'; // No progress yet for just placed order
    case OrderStatus.Shipped:
      return '36%'; // Progress to shipped
    case OrderStatus.OutForDelivery:
      return '66%'; // Progress to out for delivery
    case OrderStatus.Delivered:
      return '100%'; // Fully delivered
    case OrderStatus.Cancelled:
      return '0%'; // No progress if cancelled
    default:
      return '0%';
  }
}
}