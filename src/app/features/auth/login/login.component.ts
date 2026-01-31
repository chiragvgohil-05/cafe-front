import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

    constructor(private router: Router) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        // TODO: Implement actual authentication logic
        console.log('Login attempt:', { email: this.email, password: this.password });

        // For now, just navigate to home or admin
        // You can add your authentication service here
        if (this.email && this.password) {
            // Example: Navigate to admin if email contains 'admin'
            if (this.email.includes('admin')) {
                this.router.navigate(['/admin']);
            } else {
                this.router.navigate(['/']);
            }
        }
    }
}
