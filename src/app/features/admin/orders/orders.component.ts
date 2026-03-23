import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  searchTerm: string = '';
  selectedStatus: string = 'All Status';
  loading = false;
  orders: any[] = [];
  
  orderStats = [
    { label: 'Total Orders', value: 0, color: 'text-dark' },
    { label: 'Pending', value: 0, color: 'text-blue' },
    { label: 'Served', value: 0, color: 'text-orange' },
    { label: 'Completed', value: 0, color: 'text-green' }
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.orders = res.data;
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Failed to load orders');
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    const total = this.orders.length;
    const pending = this.orders.filter(o => o.orderStatus === 'pending').length;
    const served = this.orders.filter(o => o.orderStatus === 'served').length;
    const completed = this.orders.filter(o => o.orderStatus === 'completed').length;

    this.orderStats[0].value = total;
    this.orderStats[1].value = pending;
    this.orderStats[2].value = served;
    this.orderStats[3].value = completed;
  }

  onStatusChange(orderId: string, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Order status updated to ${newStatus}`);
          this.loadOrders(); // Refresh
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Update failed');
      }
    });
  }

  get filteredOrders() {
    return this.orders.filter(order => {
      const customerName = order.userId?.name || 'Guest User';
      const orderId = order._id.slice(-6);
      const matchesSearch =
        orderId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'All Status' || order.orderStatus === this.selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'preparing': return 'status-preparing';
      case 'served': return 'status-preparing'; // Reusing preparing color for served
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getItemSummary(items: any[]): string {
    return items.map(i => `${i.quantity}x ${i.itemId?.name || 'Item'}`).join(', ');
  }
}
