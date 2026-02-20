import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ProductCardItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryName?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductCardItem;
  @Input() showCategory = true;
  @Input() fallbackImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80';

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = this.fallbackImage;
    }
  }
}
