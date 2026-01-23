import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class Menu {
  categories = ['All', 'Coffee', 'Bakery', 'Specials'];
  currentCategory = 'All';

  menuItems: MenuItem[] = [
    { id: 1, name: 'Cappuccino Art', description: 'Rich espresso with steamed milk foam art.', price: 4.50, category: 'Coffee', rating: 5, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Macaron Set', description: 'Assorted french macarons.', price: 12.00, category: 'Bakery', rating: 4.8, image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Cold Brew', description: 'Steeped for 24 hours for smoothness.', price: 5.00, category: 'Coffee', rating: 4.9, image: 'https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'Avocado Toast', description: 'Sourdough bread topped with creamy avocado.', price: 8.00, category: 'Specials', rating: 5, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80' },
    { id: 5, name: 'Berry Tart', description: 'Fresh berries on a vanilla custard base.', price: 5.25, category: 'Bakery', rating: 4.5, image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80' },
    { id: 6, name: 'Matcha Latte', description: 'Premium grade matcha with oat milk.', price: 5.50, category: 'Coffee', rating: 4.7, image: 'https://images.unsplash.com/photo-1515822966558-6b3bc09025ce?auto=format&fit=crop&w=800&q=80' },
  ];

  get filteredItems() {
    return this.currentCategory === 'All'
      ? this.menuItems
      : this.menuItems.filter(item => item.category === this.currentCategory);
  }

  setCategory(category: string) {
    this.currentCategory = category;
  }
}
