import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCategoryWithItems, MenuService, MenuItem } from '../../core/services/menu.service';

import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { TableService, Table } from '../../core/services/table.service';

export interface LocalMenuItem extends Omit<MenuItem, '_id'> {
  _id: string; // Required for template
  category?: string;
}

interface SelectedMenuItem extends LocalMenuItem {
  quantity: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class Menu implements OnInit {
  private menuService = inject(MenuService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private tableService = inject(TableService);

  readonly fallbackImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80';

  categoriesWithItems: MenuCategoryWithItems[] = [];
  loading = true;
  errorMessage = '';
  menuItems: LocalMenuItem[] = [];

  // Flow State
  isLoggedIn = false;

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadMenuItems();
  }

  private loadMenuItems(): void {
    this.loading = true;
    this.menuService.getMenuItems().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categoriesWithItems = res.data;
          this.menuItems = res.data.flatMap(cat => 
            cat.items.map(item => ({...item, _id: item._id!, category: cat.name}))
          );
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load menu. Please try again later.';
        this.loading = false;
        console.error('Menu load error:', err);
      }
    });
  }

  get filteredItems() {
    return this.menuItems.filter(item => item.isAvailable);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = this.fallbackImage;
    }
  }
}
