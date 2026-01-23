import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'booked' | 'reserved';
  type: 'Window' | 'Center' | 'Booth';
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: 'Coffee' | 'Snacks' | 'Dessert';
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css',
})
export class Reservation {
  currentStep = 1;
  bookingForm: FormGroup;

  // State
  selectedTable: Table | null = null;
  cart: CartItem[] = [];
  bookingId: string = '';

  // Mock Data
  tables: Table[] = [
    // 2 Seaters (8 tables)
    { id: 1, name: 'T1', capacity: 2, status: 'available', type: 'Window' },
    { id: 2, name: 'T2', capacity: 2, status: 'booked', type: 'Window' },
    { id: 3, name: 'T3', capacity: 2, status: 'available', type: 'Center' },
    { id: 4, name: 'T4', capacity: 2, status: 'available', type: 'Center' },
    { id: 5, name: 'T5', capacity: 2, status: 'available', type: 'Booth' },
    { id: 6, name: 'T6', capacity: 2, status: 'available', type: 'Booth' },
    { id: 7, name: 'T7', capacity: 2, status: 'booked', type: 'Center' },
    { id: 8, name: 'T8', capacity: 2, status: 'available', type: 'Window' },
    // 4 Seaters (4 tables)
    { id: 9, name: 'T9', capacity: 4, status: 'available', type: 'Center' },
    { id: 10, name: 'T10', capacity: 4, status: 'available', type: 'Window' },
    { id: 11, name: 'T11', capacity: 4, status: 'booked', type: 'Booth' },
    { id: 12, name: 'T12', capacity: 4, status: 'available', type: 'Center' },
    // 6 Seaters (2 tables)
    { id: 13, name: 'T13', capacity: 6, status: 'available', type: 'Booth' },
    { id: 14, name: 'T14', capacity: 6, status: 'available', type: 'Booth' },
    // 8 Seaters (2 tables)
    { id: 15, name: 'T15', capacity: 8, status: 'booked', type: 'Center' },
    { id: 16, name: 'T16', capacity: 8, status: 'available', type: 'Window' },
  ];

  products: Product[] = [
    { id: 1, name: 'Cappuccino', price: 4.5, category: 'Coffee', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200' },
    { id: 2, name: 'Latte', price: 5.0, category: 'Coffee', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200' },
    { id: 3, name: 'Croissant', price: 3.5, category: 'Snacks', image: 'https://images.unsplash.com/photo-1555507036-ab1f40388085?w=200' },
    { id: 4, name: 'Cheesecake', price: 6.0, category: 'Dessert', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=200' },
  ];

  timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      time: ['', Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  // Getters
  get guestCount() { return this.bookingForm.get('guests')?.value; }
  get cartTotal() { return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0); }

  // Step Navigation
  nextStep() {
    if (this.currentStep === 1 && this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    if (this.currentStep === 2 && !this.selectedTable) {
      alert('Please select a table to proceed.');
      return;
    }
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  // Logic
  updateGuests(change: number) {
    const currentVal = this.guestCount || 0;
    const newVal = currentVal + change;
    if (newVal >= 1 && newVal <= 10) {
      this.bookingForm.patchValue({ guests: newVal });
    }
  }

  selectTime(time: string) {
    this.bookingForm.patchValue({ time });
  }

  isTableValid(table: Table): boolean {
    if (table.status !== 'available') return false;
    return table.capacity >= this.guestCount;
  }

  selectTable(table: Table) {
    if (this.isTableValid(table)) {
      this.selectedTable = table;
    }
  }

  // Cart Logic
  addToCart(product: Product) {
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
  }

  removeFromCart(itemId: number) {
    const index = this.cart.findIndex(item => item.id === itemId);
    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    }
  }

  confirmBooking() {
    this.bookingId = 'BK-' + Math.floor(Math.random() * 10000);
    this.currentStep = 5; // Success state
  }
}
