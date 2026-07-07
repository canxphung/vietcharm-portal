import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css',
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
