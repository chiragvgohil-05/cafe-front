import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private toastService = inject(ToastService);

  stats: any[] = [];
  upcomingReservations: any[] = [];
  popularItems: any[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        if (res.success) {
          const s = res.data.stats;
          this.stats = [
            { label: 'Total Revenue', value: '₹' + s.totalRevenue.toLocaleString(), iconBg: 'bg-green-light', icon: 'revenue' },
            { label: 'Active Customers', value: s.activeCustomers.toLocaleString(), iconBg: 'bg-orange-light', icon: 'customers' },
            { label: 'Today Reservations', value: s.todayReservations.toLocaleString(), iconBg: 'bg-purple-light', icon: 'reservations' }
          ];

          this.upcomingReservations = res.data.upcomingReservations || [];

          this.popularItems = res.data.popularItems.map((p: any) => ({
            name: p.name,
            orders: p.orders,
            price: '₹' + p.revenue.toLocaleString(),
            percentage: p.percentage
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load dashboard data');
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'preparing': return 'status-preparing';
      case 'pending': return 'status-pending';
      case 'served': return 'status-preparing'; // Re-use styling
      default: return 'status-pending';
    }
  }
}
