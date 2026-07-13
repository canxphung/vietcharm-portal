import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core';
import type { BookingCartItem, ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { VndPipe } from '@/pipes/vnd.pipe';

@Component({
  selector: 'app-quick-view-popup',
  standalone: true,
  imports: [
    VndPipe,
  ],
  templateUrl: './quick-view-popup.component.html',
  styleUrl: './quick-view-popup.component.css',
})
export class QuickViewPopupComponent implements AfterViewInit, OnDestroy {
  @ViewChild('quickViewDialog') private readonly dialogRef?: ElementRef<HTMLDialogElement>;

  readonly item = input.required<ViewableItem>();
  readonly closed = output<void>();
  readonly added = signal(false);
  private hasClosed = false;

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    private readonly cart: CartService,
  ) {}

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const dialog = this.dialogRef?.nativeElement;
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  ngOnDestroy(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (dialog?.open) dialog.close();
  }

  close(): void {
    if (this.hasClosed) return;
    this.hasClosed = true;
    const dialog = this.dialogRef?.nativeElement;
    if (dialog?.open) dialog.close();
    this.closed.emit();
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialogRef?.nativeElement) this.close();
  }

  typeLabel(): string {
    const item = this.item();
    const vi = this.i18n.isVi();
    if (item.type === 'hotel') return vi ? 'Khách sạn' : 'Hotel';
    if (item.type === 'vehicle') return vi ? 'Phương tiện' : 'Vehicle';
    if (item.type === 'activity') return vi ? 'Trải nghiệm' : 'Experience';
    return vi ? 'Điểm tham quan' : 'Attraction';
  }

  addToCart(): void {
    if (this.added()) return;
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
    this.added.set(true);
  }

  viewDetails(): void {
    this.close();
    this.ui.viewItem(this.item());
  }
}
