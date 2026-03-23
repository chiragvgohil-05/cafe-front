import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api/dashboard';
  private http = inject(HttpClient);

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
