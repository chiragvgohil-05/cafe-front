import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableService, Table } from '../../../core/services/table.service';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent implements OnInit {
  private tableService = inject(TableService);
  private fb = inject(FormBuilder);

  tables: Table[] = [];
  searchTerm: string = '';

  // Modal State
  isModalOpen = false;
  isEditMode = false;
  selectedTableId: string | null = null;
  tableForm: FormGroup;
  loading = false;
  errorMessage = '';

  // Delete Modal
  showDeleteModal = false;
  selectedTable: Table | null = null;
  isDeleting = false;

  // Stats
  tableStats = [
    { label: 'Total Tables', value: '0', color: 'text-dark' },
    { label: 'Available', value: '0', color: 'text-green' },
    { label: 'Occupied', value: '0', color: 'text-brown' },
    { label: 'Reserved', value: '0', color: 'text-blue' }
  ];

  constructor() {
    this.tableForm = this.fb.group({
      tableNumber: ['', Validators.required],
      capacity: [2, [Validators.required, Validators.min(1)]],
      type: ['Standard', Validators.required],
      status: ['available']
    });
  }

  ngOnInit() {
    this.loadTables();
  }

  loadTables() {
    this.loading = true;
    this.tableService.listTables().subscribe({
      next: (res) => {
        this.tables = res.data || [];
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load tables';
      }
    });
  }

  calculateStats() {
    this.tableStats[0].value = this.tables.length.toString();
    this.tableStats[1].value = this.tables.filter(t => t.status === 'available').length.toString();
    this.tableStats[2].value = this.tables.filter(t => t.status === 'occupied').length.toString();
    this.tableStats[3].value = this.tables.filter(t => t.status === 'reserved').length.toString();
  }

  get filteredTables() {
    if (!this.searchTerm) return this.tables;
    return this.tables.filter(t =>
      t.tableNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      t.status.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Modal Actions
  openCreateModal() {
    this.isEditMode = false;
    this.selectedTableId = null;
    this.tableForm.reset({ capacity: 2, type: 'Standard', status: 'available' });
    this.isModalOpen = true;
  }

  openEditModal(table: Table) {
    this.isEditMode = true;
    this.selectedTableId = table._id;
    this.tableForm.patchValue({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      type: table.type || 'Standard',
      status: table.status
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.errorMessage = '';
  }

  onSubmit() {
    if (this.tableForm.invalid) return;

    this.loading = true;
    const tableData = this.tableForm.value;

    if (this.isEditMode && this.selectedTableId) {
      this.tableService.updateTable(this.selectedTableId, tableData).subscribe({
        next: () => {
          this.loadTables();
          this.closeModal();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Update failed';
        }
      });
    } else {
      this.tableService.createTable(tableData).subscribe({
        next: () => {
          this.loadTables();
          this.closeModal();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Creation failed';
        }
      });
    }
  }

  openDeleteModal(table: Table) {
    this.selectedTable = table;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.selectedTable) return;
    this.isDeleting = true;
    this.tableService.deleteTable(this.selectedTable._id).subscribe({
      next: () => {
        this.loadTables();
        this.showDeleteModal = false;
        this.isDeleting = false;
        this.selectedTable = null;
      },
      error: (err) => {
        this.isDeleting = false;
        alert(err.error?.message || 'Delete failed');
      }
    });
  }

  // Helpers
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available': return 'status-available';
      case 'occupied': return 'status-occupied';
      case 'reserved': return 'status-reserved';
      default: return '';
    }
  }

  getCardClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available': return 'card-available';
      case 'occupied': return 'card-occupied';
      case 'reserved': return 'card-reserved';
      default: return '';
    }
  }
}
