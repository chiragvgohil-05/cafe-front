import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuCategoryWithItems, MenuService } from '../../../core/services/menu.service';
import { ProductCardComponent, ProductCardItem } from '../product-card/product-card.component';

@Component({
  selector: 'app-menu-highlight',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './menu-highlight.component.html',
  styleUrl: './menu-highlight.component.css',
})
export class MenuHighlight implements OnInit {
  private menuService = inject(MenuService);

  products: ProductCardItem[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.menuService.getMenuItems().subscribe({
      next: (res) => {
        if (!res?.success || !Array.isArray(res.data)) {
          this.products = [];
          this.errorMessage = 'Unable to load menu right now.';
          this.loading = false;
          return;
        }

        this.products = res.data
          .flatMap((category: MenuCategoryWithItems) =>
            category.items
              .filter((item) => item.isAvailable)
              .map((item) => ({
                _id: item._id ?? `${category._id}-${item.name}`,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                categoryName: category.name
              }))
          );

        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.errorMessage = 'Unable to load menu right now.';
        this.loading = false;
      }
    });
  }

}
