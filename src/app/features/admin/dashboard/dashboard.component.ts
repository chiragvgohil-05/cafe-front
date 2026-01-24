import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats = [
    { label: 'Total Revenue', value: '$12,426', change: '+14.5%', isPositive: true, iconBg: 'bg-green-light', iconColor: 'text-green' },
    { label: 'Total Orders', value: '1,248', change: '+8.2%', isPositive: true, iconBg: 'bg-brown-light', iconColor: 'text-brown' },
    { label: 'Active Customers', value: '842', change: '+5.1%', isPositive: true, iconBg: 'bg-gray-light', iconColor: 'text-dark' },
    { label: 'Growth Rate', value: '23.5%', change: '+2.3%', isPositive: true, iconBg: 'bg-blue-light', iconColor: 'text-blue' }
  ];

  recentOrders = [
    { id: '#2541', customer: 'John Smith', items: '2x Latte, 1x Croissant', total: '$18.50', status: 'Completed', time: '2 min ago' },
    { id: '#2540', customer: 'Sarah Johnson', items: '1x Espresso, 2x Muffin', total: '$12.00', status: 'Preparing', time: '5 min ago' },
    { id: '#2539', customer: 'Mike Brown', items: '3x Cappuccino', total: '$15.00', status: 'Pending', time: '8 min ago' },
    { id: '#2538', customer: 'Emily Davis', items: '1x Mocha, 1x Sandwich', total: '$14.50', status: 'Completed', time: '12 min ago' },
    { id: '#2537', customer: 'Alex Wilson', items: '2x Americano', total: '$8.00', status: 'Completed', time: '15 min ago' }
  ];

  popularItems = [
    { name: 'Cappuccino', orders: 245, price: '$1,225', percentage: 85 },
    { name: 'Latte', orders: 198, price: '$990', percentage: 70 },
    { name: 'Espresso', orders: 167, price: '$668', percentage: 55 },
    { name: 'Mocha', orders: 134, price: '$670', percentage: 45 },
    { name: 'Americano', orders: 112, price: '$448', percentage: 35 }
  ];

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'preparing': return 'status-preparing';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }
}
