import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCategoryWithItems, MenuService } from '../../core/services/menu.service';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
}

interface SelectedMenuItem extends MenuItem {
  quantity: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class Menu implements OnInit {
  private menuService = inject(MenuService);

  readonly fallbackImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80';

  categories: string[] = ['All'];
  currentCategory = 'All';
  loading = false;
  errorMessage = '';

  menuItems: MenuItem[] = [];
  selectedItems: SelectedMenuItem[] = [];

  ngOnInit(): void {
    this.loadMenuItems();
  }

  private loadMenuItems(): void {
    this.loading = true;
    this.errorMessage = '';

    this.menuService.getMenuItems().subscribe({
      next: (res) => {
        if (!res.success || !Array.isArray(res.data)) {
          this.menuItems = [];
          this.categories = ['All'];
          this.errorMessage = 'Unable to load menu right now.';
          this.loading = false;
          return;
        }

        this.menuItems = res.data.flatMap((category: MenuCategoryWithItems) =>
          category.items
            .filter((item) => item.isAvailable)
            .map((item) => ({
              _id: item._id ?? `${category._id}-${item.name}`,
              name: item.name,
              description: item.description,
              price: item.price,
              category: category.name,
              image: item.image,
              isAvailable: item.isAvailable
            }))
        );

        const dynamicCategories = Array.from(new Set(this.menuItems.map((item) => item.category)));
        this.categories = ['All', ...dynamicCategories];
        if (!this.categories.includes(this.currentCategory)) {
          this.currentCategory = 'All';
        }
        this.loading = false;
      },
      error: () => {
        this.menuItems = [];
        this.categories = ['All'];
        this.errorMessage = 'Unable to load menu right now.';
        this.loading = false;
      }
    });
  }

  get filteredItems() {
    return this.currentCategory === 'All'
      ? this.menuItems
      : this.menuItems.filter(item => item.category === this.currentCategory);
  }

  get selectedCount(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get selectedTotal(): number {
    return this.selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  setCategory(category: string) {
    this.currentCategory = category;
  }

  addToSelection(product: MenuItem): void {
    const existing = this.selectedItems.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
      return;
    }
    this.selectedItems.push({ ...product, quantity: 1 });
  }

  removeFromSelection(productId: string): void {
    const index = this.selectedItems.findIndex((item) => item._id === productId);
    if (index === -1) {
      return;
    }
    if (this.selectedItems[index].quantity > 1) {
      this.selectedItems[index].quantity -= 1;
    } else {
      this.selectedItems.splice(index, 1);
    }
  }

  getSelectedQuantity(productId: string): number {
    return this.selectedItems.find((item) => item._id === productId)?.quantity ?? 0;
  }

  clearSelection(): void {
    this.selectedItems = [];
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = this.fallbackImage;
    }
  }
}
