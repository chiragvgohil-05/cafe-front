import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCategoryWithItems, MenuService, MenuItem } from '../../core/services/menu.service';
import { OrderService } from '../../core/services/order.service';
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
  private orderService = inject(OrderService);
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
  selectedItems: SelectedMenuItem[] = [];

  // Flow State
  activeReservation: any = null;
  availableTables: Table[] = [];
  selectedTable: Table | null = null;
  showTableSelector = false;
  isLoggedIn = false;

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadMenuItems();
    if (this.isLoggedIn) {
      this.checkActiveOrder();
    }
  }

  private checkActiveOrder(): void {
    this.orderService.getActiveOrder().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const activeOrder = res.data;
          this.selectedTable = activeOrder.tableId;
          this.toastService.info(`Current Table: #${this.selectedTable?.tableNumber}`);
        } else {
          this.checkActiveReservation();
        }
      },
      error: () => this.checkActiveReservation()
    });
  }

  private checkActiveReservation(): void {
    this.reservationService.getActiveReservation().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activeReservation = res.data;
          this.selectedTable = res.data.table;
          this.toastService.success(`Welcome back! Linked to your Reservation on Table #${this.activeReservation.table.tableNumber}`);
        } else {
          this.loadAvailableTables();
        }
      },
      error: () => {
        this.loadAvailableTables();
      }
    });
  }

  private loadAvailableTables(): void {
    this.tableService.listTables().subscribe({
      next: (res) => {
        // 🔥 Only show ACTIVE AND AVAILABLE tables
        this.availableTables = res.data.filter(t => t.isActive && t.status === 'available');
      }
    });
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

  get selectedTotal(): number {
    return this.selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  addToCart(item: LocalMenuItem): void {
    const existing = this.selectedItems.find(i => i._id === item._id);
    if (existing) {
      existing.quantity++;
    } else {
      this.selectedItems.push({ ...item, quantity: 1 });
    }
  }

  removeFromCart(itemId: string): void {
    const index = this.selectedItems.findIndex(i => i._id === itemId);
    if (index > -1) {
      if (this.selectedItems[index].quantity > 1) {
        this.selectedItems[index].quantity--;
      } else {
        this.selectedItems.splice(index, 1);
      }
    }
  }

  clearSelection(): void {
    this.selectedItems = [];
  }

  initiateCheckout(): void {
    if (!this.isLoggedIn) {
      this.toastService.warning('Please login to place an order.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.selectedItems.length === 0) {
      this.toastService.warning('Your cart is empty.');
      return;
    }

    // Flow: Check if table is selected
    if (!this.selectedTable) {
      this.showTableSelector = true;
      return;
    }

    this.processOrder();
  }

  selectTable(table: Table): void {
    this.selectedTable = table;
    this.showTableSelector = false;
    this.toastService.info(`Selected Table #${table.tableNumber}`);
    this.processOrder();
  }

  private processOrder(): void {
    const orderData = {
      tableId: this.selectedTable?._id,
      reservationId: this.activeReservation?._id,
      items: this.selectedItems.map(item => ({
        itemId: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: this.selectedTotal
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('Order placed successfully!');
          this.clearSelection();
          // Optionally navigate to a success page or orders page
        } else {
          this.toastService.error(res.message || 'Failed to place order.');
        }
      },
      error: (err) => {
        console.error('Order Error:', err);
        this.toastService.error(err.error?.message || 'Error placing order.');
      }
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = this.fallbackImage;
    }
  }
}
