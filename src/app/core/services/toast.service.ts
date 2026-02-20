import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  show(message: string, type: ToastType = 'info', duration: number = 3000): number {
    const toast: ToastMessage = {
      id: this.nextId++,
      type,
      message,
      duration
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }

    return toast.id;
  }

  success(message: string, duration: number = 3000): number {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): number {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): number {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3500): number {
    return this.show(message, 'warning', duration);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}
