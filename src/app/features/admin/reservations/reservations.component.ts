import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation.service';
import { ToastService } from '../../../core/services/toast.service';

interface Reservation {
    _id: string;
    table: {
        _id: string;
        tableNumber: string;
        capacity: number;
        type: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    guests: number;
    guestDetails: {
        name: string;
        email: string;
        phone: string;
        specialRequest?: string;
    };
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus?: 'unpaid' | 'paid' | 'failed';
    securityAmount?: number;
    paidAt?: string;
    createdAt: string;
}

@Component({
    selector: 'app-reservations',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reservations.component.html',
    styleUrl: './reservations.component.css'
})
export class ReservationsComponent implements OnInit {
    private reservationService = inject(ReservationService);
    private toastService = inject(ToastService);

    reservations: Reservation[] = [];
    filteredReservations: Reservation[] = [];
    searchTerm: string = '';
    loading = false;
    errorMessage = '';

    // Filter states
    statusFilter: string = 'all';
    dateFilter: string = '';

    // Stats
    stats = {
        total: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
    };

    // Modals
    showDeleteModal = false;
    showDetailsModal = false;
    selectedReservation: Reservation | null = null;
    isDeleting = false;

    ngOnInit() {
        this.loadReservations();
    }

    loadReservations() {
        this.loading = true;
        this.reservationService.getAllReservations().subscribe({
            next: (data) => {
                this.reservations = data;
                this.applyFilters();
                this.calculateStats();
                this.loading = false;
            },
            error: (err: any) => {
                console.error(err);
                this.errorMessage = 'Failed to load reservations';
                this.loading = false;
            }
        });
    }

    calculateStats() {
        this.stats.total = this.reservations.length;
        this.stats.confirmed = this.reservations.filter(r => r.status === 'confirmed').length;
        this.stats.completed = this.reservations.filter(r => r.status === 'completed').length;
        this.stats.cancelled = this.reservations.filter(r => r.status === 'cancelled').length;
    }

    applyFilters() {
        this.filteredReservations = this.reservations.filter(res => {
            const searchLower = this.searchTerm.toLowerCase();
            const matchesSearch = !this.searchTerm ||
                res.guestDetails.name?.toLowerCase().includes(searchLower) ||
                res.guestDetails.email?.toLowerCase().includes(searchLower) ||
                res.guestDetails.phone?.includes(this.searchTerm) ||
                res.table?.tableNumber?.toString().toLowerCase().includes(searchLower);

            const matchesStatus = this.statusFilter === 'all' || res.status === this.statusFilter;

            const matchesDate = !this.dateFilter || res.date === this.dateFilter;

            return matchesSearch && matchesStatus && matchesDate;
        });
    }

    onSearchChange() {
        this.applyFilters();
    }

    onStatusFilterChange(status: string) {
        this.statusFilter = status;
        this.applyFilters();
    }

    onDateFilterChange() {
        this.applyFilters();
    }

    resetFilters() {
        this.statusFilter = 'all';
        this.dateFilter = '';
        this.searchTerm = '';
        this.applyFilters();
    }

    getStatusClass(status: string): string {
        return `status-${status}`;
    }

    getPaymentClass(status?: string): string {
        return status ? `payment-${status}` : 'payment-unpaid';
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    openDetailsModal(reservation: Reservation) {
        this.selectedReservation = reservation;
        this.showDetailsModal = true;
    }

    openDeleteModal(reservation: Reservation) {
        this.selectedReservation = reservation;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.selectedReservation) return;

        this.isDeleting = true;
        this.reservationService.deleteReservation(this.selectedReservation._id).subscribe({
            next: () => {
                this.loadReservations();
                this.showDeleteModal = false;
                this.isDeleting = false;
                this.selectedReservation = null;
                this.toastService.success('Reservation deleted successfully');
            },
            error: (err: any) => {
                console.error(err);
                this.errorMessage = 'Failed to delete reservation';
                this.isDeleting = false;
                this.toastService.error(err?.error?.message || this.errorMessage);
            }
        });
    }

    updateStatus(id: string, newStatus: string) {
        this.reservationService.updateReservationStatus(id, newStatus).subscribe({
            next: () => {
                this.loadReservations();
                this.toastService.success(`Reservation marked as ${newStatus}`);
            },
            error: (err: any) => {
                console.error(err);
                this.errorMessage = 'Failed to update status';
                this.toastService.error(err?.error?.message || this.errorMessage);
            }
        });
    }
}
