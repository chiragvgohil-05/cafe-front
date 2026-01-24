import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent {
  searchTerm: string = '';
  
  tableStats = [
     { label: 'Total Tables', value: '12', color: 'text-dark' },
     { label: 'Available', value: '4', color: 'text-green' },
     { label: 'Occupied', value: '4', color: 'text-brown' },
     { label: 'Reserved', value: '2', color: 'text-blue' }
  ];

  tables = [
      { id: 'T1', seats: 2, status: 'Available', customer: '', time: '' },
      { id: 'T2', seats: 4, status: 'Occupied', customer: 'John Smith', time: 'Since 10:30 AM' },
      { id: 'T3', seats: 2, status: 'Occupied', customer: 'Sarah Johnson', time: 'Since 10:45 AM' },
      { id: 'T4', seats: 6, status: 'Reserved', customer: 'Reserved for 11:30 AM', time: '' },
      { id: 'T5', seats: 4, status: 'Occupied', customer: 'Mike Brown', time: 'Since 10:15 AM' },
      { id: 'T6', seats: 2, status: 'Available', customer: '', time: '' },
      { id: 'T7', seats: 4, status: 'Cleaning', customer: '', time: '' },
      { id: 'T8', seats: 8, status: 'Available', customer: '', time: '' },
      { id: 'T9', seats: 2, status: 'Occupied', customer: 'Emily Davis', time: 'Since 10:50 AM' },
      { id: 'T10', seats: 4, status: 'Reserved', customer: 'Reserved for 12:00 PM', time: '' },
      { id: 'T11', seats: 6, status: 'Available', customer: '', time: '' },
      { id: 'T12', seats: 2, status: 'Cleaning', customer: '', time: '' }
  ];

  get filteredTables() {
      if (!this.searchTerm) return this.tables;
      return this.tables.filter(t => t.id.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                                     t.status.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'available': return 'status-available';
      case 'occupied': return 'status-occupied';
      case 'reserved': return 'status-reserved';
      case 'cleaning': return 'status-cleaning';
      default: return '';
    }
  }

  getCardClass(status: string): string {
       switch (status.toLowerCase()) {
      case 'available': return 'card-available';
      case 'occupied': return 'card-occupied';
      case 'reserved': return 'card-reserved';
      case 'cleaning': return 'card-cleaning';
      default: return '';
    }
  }
}
