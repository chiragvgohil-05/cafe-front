import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    private apiUrl = 'http://localhost:5000/api/reservations';

    constructor(private http: HttpClient) { }

    getAvailableTables(date: string, startTime: string, endTime: string, guests: number): Observable<any[]> {
        const params = new HttpParams()
            .set('date', date)
            .set('startTime', startTime)
            .set('endTime', endTime)
            .set('guests', guests.toString());

        // Using '/available' as defined in backend Routes
        return this.http.get<any[]>(`${this.apiUrl}/available`, { params });
    }

    createReservation(reservationData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}`, reservationData);
    }

    getMyReservations(email?: string, phone?: string): Observable<any[]> {
        let params = new HttpParams();
        if (email) params = params.set('email', email);
        if (phone) params = params.set('phone', phone);

        return this.http.get<any[]>(`${this.apiUrl}`, { params });
    }

    getMenuItems(): Observable<any[]> {
        return this.http.get<any[]>('http://localhost:5000/api/category/menu-list');
    }

    getAllReservations(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/all`);
    }

    updateReservationStatus(id: string, status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
    }

    deleteReservation(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
