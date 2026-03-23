import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email: string = '';
    password: string = '';
    showPassword: boolean = false;
    loading: boolean = false;

    constructor(
        private router: Router,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        if (!this.email || !this.password) {
            return;
        }

        this.loading = true;
        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.success) {
                    this.toastService.success('Login successful! Welcome back.');
                    // Role based redirection
                    const user = response.data;
                    if (user.role === 'admin') {
                        this.router.navigate(['/admin']);
                    } else {
                        this.router.navigate(['/']);
                    }
                } else {
                    this.toastService.error(response.message || 'Login failed');
                }
            },
            error: (error) => {
                this.loading = false;
                const message = error.error?.message || 'Invalid credentials or server error';
                this.toastService.error(message);
                console.error('Login error:', error);
            }
        });
    }
}
