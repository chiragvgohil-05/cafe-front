import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  users: any[] = [];
  searchTerm: string = '';
  loading = false;

  // Modal states
  showUserModal = false;
  showDeleteModal = false;
  isEditMode = false;
  isSubmitting = false;
  selectedUser: any = null;
  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['customer', Validators.required],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.show('Failed to load users', 'error');
        this.loading = false;
      }
    });
  }

  get filteredUsers() {
    return this.users.filter(user => 
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openEditModal(user: any) {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    this.showUserModal = true;
  }

  openDeleteModal(user: any) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    const userData = { ...this.userForm.value };
    if (!userData.password) delete userData.password;

    if (this.isEditMode && this.selectedUser) {
      this.userService.updateUser(this.selectedUser._id, userData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.show('User updated successfully', 'success');
            this.showUserModal = false;
            this.loadUsers();
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastService.show(err.error?.message || 'Update failed', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  confirmDelete() {
    if (this.selectedUser) {
      this.userService.deleteUser(this.selectedUser._id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.show('User deleted successfully', 'success');
            this.showDeleteModal = false;
            this.loadUsers();
          }
        },
        error: () => {
          this.toastService.show('Failed to delete user', 'error');
        }
      });
    }
  }
}
