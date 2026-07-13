import { Component, input, output } from '@angular/core';
import type { BookingCartItem, ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { UiStateService } from '@/services/ui-state.service';
import { VndPipe } from '@/pipes/vnd.pipe';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [VndPipe],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.css',
})
export class ItemCardComponent {
  readonly item = input.required<ViewableItem>();
  readonly cta = input('Thêm vào giỏ');
  readonly quickViewEnabled = input(false);
  readonly quickView = output<ViewableItem>();

  constructor(
    readonly ui: UiStateService,
    private readonly cart: CartService,
  ) {}

  addToCart(): void {
    const item = this.item();
    const cartItem: BookingCartItem = {
      id: item.id,
      type: item.type === 'hotel' ? 'hotel' : item.type === 'vehicle' ? 'vehicle' : 'activity',
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      details: item.description ?? item.specs,
    };
    this.cart.addItem(cartItem);
  }
}
