import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { AuthenticationService } from '../../../../Services/authentication.service';
import { ProductsService } from '../../../../Services/products.service';
import { OrderHistoryService, OrderStatus } from '../../../../Services/order-history.service';
import { ChartConfiguration, TooltipItem } from 'chart.js';
import { ChartComponent } from '../chart/chart.component';
import { Router, RouterLink } from '@angular/router';


interface PopularProduct {
  title: string;
  salesCount: number;
}

interface ActivityItem {
  type: 'user' | 'order' | 'product';
  description: string;
  timeAgo: string;
}

interface Order {
  id: number;
  date?: string | Date;
  status?: OrderStatus; // Updated to use OrderStatus enum
  items: Array<{
    id: number;
    quantity: number;
  }>;
  totalAmount: number;
  createdAt?: string | Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartComponent, NgClass , RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = true;
  users: any[] = [];
  totalUsers: number = 0;
  totalProducts: number = 0;
  totalSales: number = 0;
  totalOrders: number = 0;
  popularProducts: PopularProduct[] = [];
  recentActivities: ActivityItem[] = [];
  customersChartConfig!: ChartConfiguration;
  ordersChartConfig!: ChartConfiguration;
  orderStatusChartConfig!: ChartConfiguration;
  combinedOrdersChartConfig!: ChartConfiguration;

  constructor(
    public auth: AuthenticationService,
    private productService: ProductsService,
    private orderHistoryService: OrderHistoryService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
    this.prepareCharts();
    this.prepareOrderStatusChart();
  }

  private loadInitialData(): void {
    this.users = this.auth.getAllUsers();
    this.totalUsers = this.users.length;

    this.productService.getAllProducts().subscribe(products => {
      this.totalProducts = products.length;
    });

    const allOrders = this.orderHistoryService.getAllOrdersForAdmin();
    this.totalOrders = allOrders.length;
    this.totalSales = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    this.loadPopularProducts();
    this.loadRecentActivities();

    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  private loadPopularProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      const allOrders = this.orderHistoryService.getAllOrdersForAdmin();
      const salesCountByProductId = new Map<number, number>();
      
      allOrders.forEach(order => {
        order.items.forEach(item => {
          salesCountByProductId.set(
            item.id,
            (salesCountByProductId.get(item.id) || 0) + item.quantity
          );
        });
      });

      this.popularProducts = products
        .map(p => ({
          title: p.title,
          salesCount: salesCountByProductId.get(p.id) || 0
        }))
        .filter(p => p.salesCount > 0)
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 3);
    });
  }

  private loadRecentActivities(): void {
    const activities: ActivityItem[] = [];
    const recentUsers = this.users.slice(-1).reverse();
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        description: `New user registered → ${user.profile?.firstName || user.email}`,
        timeAgo: this.getTimeAgo(user.registrationDate || new Date())
      });
    });

    const recentOrders = this.orderHistoryService.getAllOrdersForAdmin().slice(0, 2);
    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        description: `Order #${order.id} (${order.status || 'No Status'})`,
        timeAgo: this.getTimeAgo(order.date || new Date())
      });
    });

    const updatedProducts = JSON.parse(localStorage.getItem('updatedProducts') || '[]');
    updatedProducts.slice(-3).reverse().forEach((prod: any) => {
      activities.push({
        type: 'product',
        description: `Product "${prod.title}" was updated`,
        timeAgo: this.getTimeAgo(prod.updatedAt || new Date())
      });
    });

    this.recentActivities = activities.slice(0, 5);
  }

  private prepareCharts(): void {
    this.customersChartConfig = this.createCustomerChartConfig();
    this.ordersChartConfig = this.createOrdersChartConfig();
    this.combinedOrdersChartConfig = this.createCombinedOrdersChartConfig();
  }

  private getCurrentMonthDays(): { day: number, label: string }[] {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({length: daysInMonth}, (_, i) => ({
      day: i + 1,
      label: (i + 1).toString()
    }));
  }

  private getDailyUserData(): { labels: string[]; values: number[] } {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const days = this.getCurrentMonthDays();

    const dailyCounts = days.map(day => ({ ...day, count: 0 }));

    this.users.forEach(user => {
      const userDate = new Date(user.registrationDate || user.createdAt || new Date());
      if (userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear) {
        const dayIndex = userDate.getDate() - 1;
        if (dayIndex >= 0 && dayIndex < dailyCounts.length) {
          dailyCounts[dayIndex].count++;
        }
      }
    });

    return {
      labels: dailyCounts.map(item => item.label),
      values: dailyCounts.map(item => item.count)
    };
  }

  private getDailyOrderData(): { labels: string[]; totalOrders: number[]; paidOrders: number[] } {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const dailyCounts = Array.from({length: daysInMonth}, (_, i) => ({
      day: i + 1,
      totalOrders: 0,
      paidOrders: 0
    }));

    const allOrders = this.orderHistoryService.getAllOrdersForAdmin();
    allOrders.forEach(order => {
      const orderDate = new Date(order.date || new Date());
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        const dayIndex = orderDate.getDate() - 1;
        dailyCounts[dayIndex].totalOrders++;
        if (order.paymentStatus === 'paid') {
          dailyCounts[dayIndex].paidOrders++;
        }
      }
    });

    return {
      labels: dailyCounts.map(item => item.day.toString()),
      totalOrders: dailyCounts.map(item => item.totalOrders),
      paidOrders: dailyCounts.map(item => item.paidOrders)
    };
  }

  private createCustomerChartConfig(): ChartConfiguration {
    const customerData = this.getDailyUserData();
    
    return {
      type: 'line',
      data: {
        labels: customerData.labels,
        datasets: [{
          label: 'Daily New Users',
          data: customerData.values,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#4e73df',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#4e73df',
          pointHoverBorderColor: '#fff',
          pointHitRadius: 10,
          pointBorderWidth: 2
        }]
      },
      options: this.getDailyChartOptions('Number of Users')
    };
  }

  private createOrdersChartConfig(): ChartConfiguration {
    const orderData = this.getDailyOrderData();
    
    return {
      type: 'bar',
      data: {
        labels: orderData.labels,
        datasets: [{
          label: 'Daily Orders',
          data: orderData.totalOrders,
          backgroundColor: '#1cc88a',
          hoverBackgroundColor: '#17a673',
          borderColor: '#1cc88a',
          borderWidth: 1,
          borderRadius: 2,
          hoverBorderColor: '#fff'
        }]
      },
      options: this.getDailyChartOptions('Number of Orders')
    };
  }

  private createCombinedOrdersChartConfig(): ChartConfiguration {
    const orderData = this.getDailyOrderData();
    
    return {
      type: 'bar',
      data: {
        labels: orderData.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Total Orders',
            data: orderData.totalOrders,
            backgroundColor: '#36a2eb',
            borderColor: '#36a2eb',
            borderWidth: 1,
            borderRadius: 2
          },
          {
            type: 'line',
            label: 'Paid Orders',
            data: orderData.paidOrders,
            borderColor: '#ff6384',
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointBackgroundColor: '#ff6384',
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            callbacks: {
              label: (context: TooltipItem<'bar'|'line'>) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#fff' },
            title: {
              display: true,
              text: 'Day of Month',
              color: '#fff'
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: {
              color: '#fff',
              precision: 0
            },
            title: {
              display: true,
              text: 'Number of Orders',
              color: '#fff'
            }
          }
        }
      }
    };
  }

  private prepareOrderStatusChart(): void {
    const statusData = this.getOrderStatusData();
    const colorPalette = [
      '#36a2eb', // Order Placed
      '#ffce56', // Processing
      '#4bc0c0', // Shipped
      '#9966ff', // Out for Delivery
      '#8ac24a', // Delivered
      '#ff6384'  // Cancelled
    ];

    this.orderStatusChartConfig = {
      type: 'pie' as const,
      data: {
        labels: statusData.labels,
        datasets: [{
          data: statusData.values,
          backgroundColor: colorPalette.slice (0, statusData.labels.length),
          hoverBackgroundColor: colorPalette
            .slice(0, statusData.labels.length)
            .map(color => `${color}aa`),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#fff',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            callbacks: {
              label: (context: TooltipItem<'pie'>) => {
                const dataset = context.dataset;
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = dataset.data[context.dataIndex] as number;
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  }

  private getOrderStatusData(): { labels: string[]; values: number[] } {
    const allOrders = this.orderHistoryService.getAllOrdersForAdmin();
    const statusCounts = new Map<string, number>();
    
    // Initialize with all enum values
    Object.values(OrderStatus).forEach(status => {
      statusCounts.set(status, 0);
    });

    // Count actual orders
    allOrders.forEach(order => {
      const status = order.status || OrderStatus.OrderPlaced;
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    // Convert to arrays and sort by count (descending)
    const sortedEntries = Array.from(statusCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedEntries.map(([status]) => status),
      values: sortedEntries.map(([_, count]) => count)
    };
  }

  private getDailyChartOptions(yAxisTitle: string): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.7)',
          callbacks: {
            title: (context: { label: string }[]) => `Day ${context[0].label}`,
            label: (context: { raw: number }) => `${yAxisTitle}: ${context.raw}`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Day of Month',
            color: '#fff'
          },
          grid: { display: false },
          ticks: { color: '#fff' }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle,
            color: '#fff'
          },
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: {
            color: '#fff',
            precision: 0,
            stepSize: 1
          }
        }
      }
    };
  }

  private getTimeAgo(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `${interval} ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }

    return 'Just now';
  }
}