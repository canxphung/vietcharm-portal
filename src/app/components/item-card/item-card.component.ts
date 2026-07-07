import { Component, input } from '@angular/core';
import { LucideHeart, LucideShoppingBag, LucideStar } from '@lucide/angular';
import type { BookingCartItem, ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { UiStateService } from '@/services/ui-state.service';
import { VndPipe } from '@/pipes/vnd.pipe';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [VndPipe, LucideHeart, LucideShoppingBag, LucideStar],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.css',
})
export class ItemCardComponent {
  readonly item = input.required<ViewableItem>();
  readonly cta = input('Thêm vào giỏ');

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
