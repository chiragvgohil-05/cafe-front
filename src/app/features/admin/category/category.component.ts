import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService, Category } from '../../../core/services/menu.service';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './category.component.html',
    styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
    private menuService = inject(MenuService);
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
                    }
                    this.isSubmitting = false;
                },
                error: (err) => {
                    console.error('Update category error:', err);
                    this.isSubmitting = false;
                }
            });
        } else {
            this.menuService.createCategory(categoryData).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.showCategoryModal = false;
                        this.loadCategories();
                    }
                    this.isSubmitting = false;
                },
                error: (err) => {
                    console.error('Create category error:', err);
                    this.isSubmitting = false;
                }
            });
        }
    }

    confirmDelete() {
        if (this.selectedCategory) {
            this.menuService.deleteCategory(this.selectedCategory._id).subscribe(res => {
                if (res.success) {
                    this.showDeleteModal = false;
                    this.loadCategories();
                }
            });
        }
    }

    getStatusClass(isActive: boolean): string {
        return isActive ? 'status-active' : 'status-inactive';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
