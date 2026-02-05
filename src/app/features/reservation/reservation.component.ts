import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../core/services/reservation.service';
import { Router, RouterModule } from '@angular/router';

interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  type: string;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css',
})
export class Reservation implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  currentStep = 1;
  bookingForm: FormGroup;

  // State
  selectedTable: Table | null = null;
  availableTables: Table[] = [];
  cart: CartItem[] = [];
  bookingId: string = '';
  loading = false;
  errorMessage = '';

  // Menu items from backend
  menuItems: MenuItem[] = [];

  constructor() {
    this.bookingForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['11:00', Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      specialRequest: ['']
    });
  }

  ngOnInit() {
    this.loadMenuItems();
  }

  loadMenuItems() {
    this.reservationService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
      },
      error: (err) => console.error('Failed to load menu items:', err)
    });
  }

  // Getters
  get guestCount() { return this.bookingForm.get('guests')?.value; }
  get cartTotal() { return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0); }

  // Step Navigation
  nextStep() {
    if (this.currentStep === 1) {
      if (this.bookingForm.invalid) {
        this.bookingForm.markAllAsTouched();
        return;
      }
      this.fetchAvailableTables();
    } else if (this.currentStep === 2) {
      if (!this.selectedTable) {
        alert('Please select a table to proceed.');
        return;
      }
      this.currentStep++;
    } else if (this.currentStep === 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    this.currentStep--;
    this.errorMessage = '';
  }

  // API Logic
  fetchAvailableTables() {
    this.loading = true;
    this.errorMessage = '';
    const { date, startTime, endTime, guests } = this.bookingForm.value;

    this.reservationService.getAvailableTables(date, startTime, endTime, guests).subscribe({
      next: (tables) => {
        this.availableTables = tables;
        this.loading = false;
        if (tables.length === 0) {
          this.errorMessage = 'No tables available for this slot. Please try a different time.';
        } else {
          this.currentStep++;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to fetch tables. Please try again.';
        console.error(err);
      }
    });
  }

  updateGuests(change: number) {
    const currentVal = this.guestCount || 0;
    const newVal = currentVal + change;
    if (newVal >= 1 && newVal <= 10) {
      this.bookingForm.patchValue({ guests: newVal });
    }
  }

  selectTable(table: Table) {
    this.selectedTable = table;
  }

  // Cart Logic
  addToCart(product: MenuItem) {
    const existing = this.cart.find(item => item._id === product._id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
  }

  removeFromCart(itemId: string) {
    const index = this.cart.findIndex(item => item._id === itemId);
    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    }
  }

  confirmBooking() {
    this.loading = true;
    const formData = this.bookingForm.value;

    const reservationData = {
      tableId: this.selectedTable?._id,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      guests: formData.guests,
      guestDetails: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialRequest: formData.specialRequest
      }
    };

    this.reservationService.createReservation(reservationData).subscribe({
      next: (res) => {
        this.bookingId = res.reservation._id;
        this.loading = false;
        this.currentStep = 5;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Booking failed. Please try again.';
      }
    });
  }
}
