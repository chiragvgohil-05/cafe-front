import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

interface ReservationItem {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    guests: number;
    status: string;
    table?: {
        tableNumber?: string;
    } | null;
    guestDetails?: {
        name?: string;
    } | null;
}

@Component({
    selector: 'app-my-reservations',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './my-reservations.component.html',
    styleUrl: './my-reservations.component.css'
})
export class MyReservationsComponent {
    private reservationService = inject(ReservationService);
    private toastService = inject(ToastService);

    email = '';
    phone = '';
    reservations: ReservationItem[] = [];
    loading = false;
    searched = false;
    showCancelModal = false;
    isCancelling = false;
    selectedReservation: ReservationItem | null = null;

    findReservations() {
        if (!this.email && !this.phone) {
            this.toastService.warning('Please enter email or phone number');
            return;
        }

        this.loading = true;
        this.searched = true;
        this.reservationService.getMyReservations(this.email, this.phone).subscribe({
            next: (data) => {
                this.reservations = Array.isArray(data) ? data : [];
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.reservations = [];
                this.toastService.error(this.getErrorMessage(err, 'Failed to load reservations'));
            }
        });
    }

    openCancelModal(reservation: ReservationItem) {
        this.selectedReservation = reservation;
        this.showCancelModal = true;
    }

    closeCancelModal() {
        if (this.isCancelling) {
            return;
        }
        this.showCancelModal = false;
        this.selectedReservation = null;
    }

    confirmCancelReservation() {
        if (!this.selectedReservation || this.isCancelling) {
            return;
        }

        this.isCancelling = true;
        const reservationId = this.selectedReservation._id;

        this.reservationService.updateReservationStatus(reservationId, 'cancelled').subscribe({
            next: () => {
                this.isCancelling = false;
                this.showCancelModal = false;
                this.toastService.success('Reservation cancelled successfully');
                this.reservations = this.reservations.map((reservation) =>
                    reservation._id === reservationId
                        ? { ...reservation, status: 'cancelled' }
                        : reservation
                );
                this.selectedReservation = null;
            },
            error: (err) => {
                console.error(err);
                this.isCancelling = false;
                this.toastService.error(this.getErrorMessage(err, 'Failed to cancel reservation'));
            }
        });
    }

    private getErrorMessage(error: unknown, fallback: string): string {
        if (typeof error === 'object' && error !== null) {
            const apiError = error as { error?: { message?: string }; message?: string };
            return apiError.error?.message || apiError.message || fallback;
        }
        return fallback;
    }
}
