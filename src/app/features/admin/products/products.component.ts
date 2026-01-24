import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  searchTerm: string = '';
  products = [
    { name: 'Cappuccino', category: 'Hot Drinks', price: '$5.00', stock: 150, status: 'In Stock' },
    { name: 'Latte', category: 'Hot Drinks', price: '$5.00', stock: 120, status: 'In Stock' },
    { name: 'Espresso', category: 'Hot Drinks', price: '$4.00', stock: 200, status: 'In Stock' },
    { name: 'Mocha', category: 'Hot Drinks', price: '$5.50', stock: 80, status: 'In Stock' },
    { name: 'Iced Latte', category: 'Cold Drinks', price: '$5.50', stock: 90, status: 'In Stock' },
    { name: 'Croissant', category: 'Pastries', price: '$3.50', stock: 45, status: 'Low Stock' },
    { name: 'Blueberry Muffin', category: 'Pastries', price: '$3.00', stock: 30, status: 'Low Stock' },
    { name: 'Avocado Toast', category: 'Food', price: '$8.00', stock: 0, status: 'Out of Stock' }
  ];

  get filteredProducts() {
    return this.products.filter(product => 
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock': return 'status-in-stock';
      case 'Low Stock': return 'status-low-stock';
      case 'Out of Stock': return 'status-out-stock';
      default: return '';
    }
  }
}
