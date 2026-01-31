import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService, Category, MenuItem } from '../../../core/services/menu.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  private menuService = inject(MenuService);
  private fb = inject(FormBuilder);

  searchTerm: string = '';
  products: any[] = [];
  categories: Category[] = [];
  currentCategory: string = 'All';

  // Modal states
  showProductModal = false;
  showDeleteModal = false;
  isEditMode = false;
  isSubmitting = false;
  selectedProduct: any = null;
  productForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      isAvailable: [true]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.menuService.getCategories(true).subscribe(res => {
      if (res.success) this.categories = res.data;
    });
    this.menuService.getMenuItems().subscribe(res => {
      if (res.success) {
        this.products = res.data.flatMap((cat: any) =>
          cat.items.map((item: any) => ({
            ...item,
            categoryId: cat._id,
            categoryName: cat.name
          }))
        );
      }
    });
  }

  get filteredProducts() {
    return this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.currentCategory === 'All' || product.categoryId === this.currentCategory;
      return matchesSearch && matchesCategory;
    });
  }

  setCategory(categoryId: string) {
    this.currentCategory = categoryId;
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedProduct = null;

    // Default values
    const defaultValues: any = { isAvailable: true };
    if (this.categories.length > 0) {
      defaultValues.categoryId = this.categories[0]._id;
    }

    this.productForm.reset(defaultValues);
    this.selectedFile = null;
    this.imagePreview = null;
    this.showProductModal = true;
  }

  openEditModal(product: any) {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.productForm.patchValue({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      description: product.description,
      isAvailable: product.isAvailable
    });
    this.imagePreview = product.image;
    this.showProductModal = true;
  }

  openDeleteModal(product: any) {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    const formData = new FormData();
    Object.keys(this.productForm.value).forEach(key => {
      formData.append(key, this.productForm.value[key]);
    });
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditMode) {
      this.menuService.updateMenuItem(this.selectedProduct._id, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.showProductModal = false;
            this.loadData();
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Update product error:', err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.menuService.createMenuItem(formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.showProductModal = false;
            this.loadData();
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Create product error:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  confirmDelete() {
    if (this.selectedProduct) {
      this.menuService.deleteMenuItem(this.selectedProduct._id).subscribe(res => {
        if (res.success) {
          this.showDeleteModal = false;
          this.loadData();
        }
      });
    }
  }

  getStatusClass(isAvailable: boolean): string {
    return isAvailable ? 'status-in-stock' : 'status-out-stock';
  }

  getStatusText(isAvailable: boolean): string {
    return isAvailable ? 'Available' : 'Unavailable';
  }
}
