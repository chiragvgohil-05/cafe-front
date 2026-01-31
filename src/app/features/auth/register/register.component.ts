import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    fullName: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;
    loading: boolean = false;

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit() {
        if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
            return;
        }

        if (this.password !== this.confirmPassword) {
            return;
        }

        this.loading = true;
        this.authService.register({
            name: this.fullName,
            email: this.email,
            password: this.password,
            role: 'customer' // Default role
        }).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.success) {
                    this.router.navigate(['/login']);
                }
            },
            error: (error) => {
                this.loading = false;
                console.error('Registration error:', error);
            }
        });
    }
}
