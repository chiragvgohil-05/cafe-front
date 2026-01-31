import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
    _id: string;
    name: string;
    isActive: boolean;
    createdAt?: string;
}

export interface MenuItem {
    _id?: string;
    cafeId?: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    isAvailable: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private apiUrl = 'http://localhost:5000/api/category';

    constructor(private http: HttpClient) { }

    getCategories(isActive?: boolean): Observable<any> {
        let url = `${this.apiUrl}/lists`;
        if (isActive !== undefined) {
            url += `?isActive=${isActive}`;
        }
        return this.http.get(url);
    }

    getMenuItems(): Observable<any> {
        return this.http.get(`${this.apiUrl}/menu-list`);
    }

    createMenuItem(formData: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/menu`, formData);
    }

    updateMenuItem(id: string, formData: FormData): Observable<any> {
        return this.http.put(`${this.apiUrl}/menu/${id}`, formData);
    }

    createCategory(categoryData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, categoryData);
    }

    updateCategory(id: string, categoryData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, categoryData);
    }

    deleteCategory(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteMenuItem(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/menu/${id}`);
    }
}
