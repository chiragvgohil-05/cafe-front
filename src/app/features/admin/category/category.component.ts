import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService, Category } from '../../../core/services/menu.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './category.component.html',
    styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
    private menuService = inject(MenuService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);

    searchTerm: string = '';
    categories: Category[] = [];

    // Modal states
    showCategoryModal = false;
    showDeleteModal = false;
    isEditMode = false;
    isSubmitting = false;
    selectedCategory: Category | null = null;
    categoryForm: FormGroup;

    constructor() {
        this.categoryForm = this.fb.group({
            name: ['', Validators.required],
            isActive: [true]
        });
    }

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.menuService.getCategories().subscribe(res => {
            if (res.success) {
                this.categories = res.data;
            }
        });
    }

    get filteredCategories() {
        return this.categories.filter(cat =>
            cat.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    openAddModal() {
        this.isEditMode = false;
        this.selectedCategory = null;
        this.categoryForm.reset({ isActive: true });
        this.showCategoryModal = true;
    }

    openEditModal(category: Category) {
        this.isEditMode = true;
        this.selectedCategory = category;
        this.categoryForm.patchValue({
            name: category.name,
            isActive: category.isActive
        });
        this.showCategoryModal = true;
    }

    openDeleteModal(category: Category) {
        this.selectedCategory = category;
        this.showDeleteModal = true;
    }

    onSubmit() {
        if (this.categoryForm.invalid) return;

        this.isSubmitting = true;
        const categoryData = this.categoryForm.value;

        if (this.isEditMode && this.selectedCategory) {
            this.menuService.updateCategory(this.selectedCategory._id, categoryData).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.showCategoryModal = false;
                        this.loadCategories();
                        this.toastService.success('Category updated successfully');
                    } else {
                        this.toastService.error(res?.message || 'Failed to update category');
                    }
                    this.isSubmitting = false;
                },
                error: (error: unknown) => {
                    console.error('Update category error:', error);
                    this.toastService.error(this.getErrorMessage(error, 'Failed to update category'));
                    this.isSubmitting = false;
                }
            });
        } else {
            this.menuService.createCategory(categoryData).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.showCategoryModal = false;
                        this.loadCategories();
                        this.toastService.success('Category created successfully');
                    } else {
                        this.toastService.error(res?.message || 'Failed to create category');
                    }
                    this.isSubmitting = false;
                },
                error: (error: unknown) => {
                    console.error('Create category error:', error);
                    this.toastService.error(this.getErrorMessage(error, 'Failed to create category'));
                    this.isSubmitting = false;
                }
            });
        }
    }

    confirmDelete() {
        if (this.selectedCategory) {
            this.menuService.deleteCategory(this.selectedCategory._id).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.showDeleteModal = false;
                        this.loadCategories();
                        this.toastService.success('Category deleted successfully');
                    } else {
                        this.toastService.error(res?.message || 'Failed to delete category');
                    }
                },
                error: (error: unknown) => {
                    console.error('Delete category error:', error);
                    this.toastService.error(this.getErrorMessage(error, 'Failed to delete category'));
                }
            });
        }
    }

    private getErrorMessage(error: unknown, fallback: string): string {
        if (typeof error === 'object' && error !== null) {
            const apiError = error as { error?: { message?: string }; message?: string };
            return apiError.error?.message || apiError.message || fallback;
        }
        return fallback;
    }

    getStatusClass(isActive: boolean): string {
        return isActive ? 'status-active' : 'status-inactive';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
