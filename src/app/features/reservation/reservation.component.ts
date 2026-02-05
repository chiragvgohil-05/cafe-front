import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReservationService } from '../../core/services/reservation.service';
import { Router, RouterModule } from '@angular/router';

declare var Razorpay: any;

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
  private platformId = inject(PLATFORM_ID);

  currentStep = 1;
  bookingForm: FormGroup;

  // State
  selectedTable: Table | null = null;
  availableTables: Table[] = [];
  cart: CartItem[] = [];
  bookingId: string = '';
  loading = false;
  errorMessage = '';
  securityDeposit = 100;
  pendingReservationId: string | null = null;

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
    this.errorMessage = '';
    const formData = this.bookingForm.value;

    if (this.pendingReservationId) {
      this.createPaymentOrder(this.pendingReservationId, formData);
      return;
    }

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
        const reservation = res.reservation;
        this.bookingId = reservation._id;
        this.pendingReservationId = reservation._id;
        if (reservation?.securityAmount) {
          this.securityDeposit = reservation.securityAmount;
        }
        this.createPaymentOrder(reservation._id, formData);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Booking failed. Please try again.';
      }
    });
  }

  private async createPaymentOrder(reservationId: string, formData: any) {
    this.reservationService.createReservationPaymentOrder(reservationId).subscribe({
      next: async (res) => {
        try {
          if (res?.data?.paymentStatus === 'paid') {
            this.loading = false;
            this.currentStep = 5;
            this.pendingReservationId = null;
            return;
          }
          if (!res?.data?.razorpayOrderId) {
            this.loading = false;
            this.errorMessage = 'Payment order not available. Please try again.';
            return;
          }
          if (res?.data?.amount) {
            this.securityDeposit = Math.round(res.data.amount / 100);
          }
          if (!this.isBrowser()) {
            this.loading = false;
            this.errorMessage = 'Payment can only be completed in a browser.';
            return;
          }
          await this.loadRazorpayScript();
          this.loading = false;
          this.openRazorpayCheckout(res.data, reservationId, formData);
        } catch (err) {
          this.loading = false;
          this.errorMessage = 'Failed to load payment gateway. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to initiate payment. Please try again.';
      }
    });
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser()) {
        reject(new Error('Not in browser'));
        return;
      }
      const existing = document.getElementById('razorpay-sdk');
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      document.body.appendChild(script);
    });
  }

  private openRazorpayCheckout(orderData: any, reservationId: string, formData: any) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'CafeEro',
      description: 'Reservation security deposit',
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: '#4E342E'
      },
      handler: (response: any) => {
        this.verifyPayment(reservationId, response);
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', () => {
      this.errorMessage = 'Payment failed. Please try again.';
    });
    rzp.open();
  }

  private verifyPayment(reservationId: string, response: any) {
    this.loading = true;
    this.reservationService.verifyReservationPayment({
      reservationId,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    }).subscribe({
      next: () => {
        this.loading = false;
        this.currentStep = 5;
        this.pendingReservationId = null;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Payment verification failed.';
      }
    });
  }

  private isBrowser() {
    return isPlatformBrowser(this.platformId);
  }
}
