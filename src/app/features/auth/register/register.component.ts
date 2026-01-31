import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

    constructor(private router: Router) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit() {
        // TODO: Implement actual registration logic
        if (this.password !== this.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        console.log('Registration attempt:', {
            fullName: this.fullName,
            email: this.email,
            password: this.password
        });

        // For now, navigate to login after successful registration
        if (this.fullName && this.email && this.password) {
            alert('Registration successful! Please login.');
            this.router.navigate(['/login']);
        }
    }
}
