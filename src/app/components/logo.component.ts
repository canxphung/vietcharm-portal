import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <span class="inline-flex shrink-0 overflow-hidden" [class]="sizeClass()">
      <img
        src="/logo/logo.png"
        alt="Viet Charm Heritage & Travel"
        class="h-full w-full object-cover mix-blend-screen"
        draggable="false"
      />
    </span>
  `,
})
export class LogoComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'h-11 w-40';
      case 'lg':
        return 'h-16 w-60';
      default:
        return 'h-14 w-52';
    }
  });
}
