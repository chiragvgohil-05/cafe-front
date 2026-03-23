import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
    _id: string;
    tableId: any;
    items: {
        itemId: any;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:5000/api/order';

    constructor(private http: HttpClient) { }

    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, orderData);
    }

    getAllOrders(): Observable<any> {
        return this.http.get(`${this.apiUrl}/lists`);
    }

    getActiveOrder(): Observable<any> {
        return this.http.get(`${this.apiUrl}/active-order`);
    }

    getOrderStatus(): Observable<any> {
        return this.http.get(`${this.apiUrl}/order-status`);
    }

    updateOrderStatus(orderId: string, status: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${orderId}/status`, { status });
    }
}
