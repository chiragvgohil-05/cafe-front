import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Table {
    _id: string;
    tableNumber: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    type: string;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TableService {
    private apiUrl = 'http://localhost:5000/api/cafe-table';

    constructor(private http: HttpClient) { }

    listTables(): Observable<{ data: Table[] }> {
        return this.http.get<{ data: Table[] }>(`${this.apiUrl}/list`);
    }

    createTable(table: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, table);
    }

    updateTable(id: string, table: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/update/${id}`, table);
    }

    deleteTable(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${id}`);
    }
}
