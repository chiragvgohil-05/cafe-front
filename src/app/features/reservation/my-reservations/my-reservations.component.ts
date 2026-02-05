import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-my-reservations',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './my-reservations.component.html',
    styleUrl: './my-reservations.component.css'
})
export class MyReservationsComponent {
    private reservationService = inject(ReservationService);

    email = '';
    phone = '';
    reservations: any[] = [];
    loading = false;
    searched = false;

    findReservations() {
        if (!this.email && !this.phone) {
            alert('Please enter email or phone number');
            return;
        }

        this.loading = true;
        this.searched = true;
        this.reservationService.getMyReservations(this.email, this.phone).subscribe({
            next: (data) => {
                this.reservations = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.reservations = [];
            }
        });
    }

    cancelReservation(id: string) {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            this.reservationService.updateReservationStatus(id, 'cancelled').subscribe({
                next: () => {
                    alert('Reservation cancelled successfully');
                    this.findReservations(); // Refresh list
                },
                error: (err) => {
                    console.error(err);
                    alert('Failed to cancel reservation');
                }
            });
        }
    }
}
