import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  public authService = inject(AuthService);

  profileForm: FormGroup;
  loading = false;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profileForm.patchValue({
            name: res.data.name,
            email: res.data.email
          });
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.show('Failed to load profile', 'error');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;
    const updateData = { ...this.profileForm.value };
    if (!updateData.password) delete updateData.password;

    this.userService.updateProfile(updateData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.show('Profile updated successfully', 'success');
          // Update local storage user data
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.name = res.data.name;
          user.email = res.data.email;
          localStorage.setItem('user', JSON.stringify(user));
          this.authService.currentUser.set(user);
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastService.show(err.error?.message || 'Update failed', 'error');
        this.loading = false;
      }
    });
  }
}
