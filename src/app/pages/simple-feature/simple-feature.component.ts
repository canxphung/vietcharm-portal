import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-simple-feature-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './simple-feature.component.html',
  styleUrl: './simple-feature.component.css',
})
export class SimpleFeatureComponent {
  readonly eyebrow = input('VietCharm');
  readonly title = input('VietCharm');
  readonly description = input('');
  readonly cta = input('Explore services');
  readonly image = input('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80');
}
