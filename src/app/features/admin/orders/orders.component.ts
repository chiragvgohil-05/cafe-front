import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  searchTerm: string = '';
  selectedStatus: string = 'All Status';
  
  orderStats = [
    { label: 'Total Orders', value: '248', color: 'text-dark' },
    { label: 'Pending', value: '12', color: 'text-blue' },
    { label: 'Preparing', value: '8', color: 'text-orange' },
    { label: 'Completed', value: '228', color: 'text-green' }
  ];

  orders = [
    { id: '#2541', customer: 'John Smith', items: '2x Latte, 1x Croissant', table: 'Table 5', total: '$18.50', status: 'Completed', time: '10:30 AM' },
    { id: '#2540', customer: 'Sarah Johnson', items: '1x Espresso, 2x Muffin', table: 'Table 3', total: '$12.00', status: 'Preparing', time: '10:25 AM' },
    { id: '#2539', customer: 'Mike Brown', items: '3x Cappuccino', table: 'Table 7', total: '$15.00', status: 'Pending', time: '10:20 AM' },
    { id: '#2538', customer: 'Emily Davis', items: '1x Mocha, 1x Sandwich', table: 'Table 2', total: '$14.50', status: 'Completed', time: '10:15 AM' },
    { id: '#2537', customer: 'Alex Wilson', items: '2x Americano', table: 'Table 1', total: '$8.00', status: 'Completed', time: '10:10 AM' },
    { id: '#2536', customer: 'Lisa Anderson', items: '1x Iced Latte, 1x Cookie', table: 'Table 4', total: '$9.50', status: 'Cancelled', time: '10:05 AM' },
    { id: '#2535', customer: 'Tom Harris', items: '4x Espresso', table: 'Table 6', total: '$16.00', status: 'Completed', time: '09:55 AM' },
    { id: '#2534', customer: 'Jennifer Lee', items: '2x Mocha, 2x Croissant', table: 'Table 8', total: '$22.00', status: 'Preparing', time: '09:50 AM' }
  ];

  get filteredOrders() {
    return this.orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        order.customer.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'All Status' || order.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'preparing': return 'status-preparing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
