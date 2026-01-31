import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/auth';
    private platformId = inject(PLATFORM_ID);

    // Signals for auth state
    currentUser = signal<any>(null);
    token = signal<string | null>(null);

    constructor(private http: HttpClient) {
        if (isPlatformBrowser(this.platformId)) {
            this.loadStorage();
        }
    }

    private loadStorage() {
        if (isPlatformBrowser(this.platformId)) {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            if (savedToken && savedUser) {
                this.token.set(savedToken);
                this.currentUser.set(JSON.parse(savedUser));
            }
        }
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((response: any) => {
                if (response.success && isPlatformBrowser(this.platformId)) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.data));
                    this.token.set(response.token);
                    this.currentUser.set(response.data);
                }
            })
        );
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        this.token.set(null);
        this.currentUser.set(null);
    }

    isLoggedIn(): boolean {
        return !!this.token();
    }

    getRole(): string | null {
        return this.currentUser()?.role || null;
    }
}
