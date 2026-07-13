import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { PartnershipApplication } from '@/types';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';

@Component({
  selector: 'app-partnership-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './partnership.component.html',
  styleUrl: './partnership.component.css',
})
export class PartnershipComponent {
  readonly brandName = signal('');
  readonly contactName = signal('');
  readonly type = signal<PartnershipApplication['type']>('hotel');
  readonly phone = signal('');
  readonly email = signal('');
  readonly description = signal('');
  readonly submittedCode = signal<string | null>(null);

  constructor(
    readonly i18n: I18nService,
    private readonly catalog: CatalogService,
  ) {}

  async submit(): Promise<void> {
    if (!this.brandName().trim() || !this.contactName().trim()) return;
    const trackingId = `VC-PARTNER-${1000 + Math.floor(Math.random() * 8999)}`;
    await this.catalog.addApplication({
      id: trackingId,
      brandName: this.brandName().trim(),
      contactName: this.contactName().trim(),
      type: this.type(),
      phone: this.phone().trim(),
      email: this.email().trim(),
      description: this.description().trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });
    this.submittedCode.set(trackingId);
    this.brandName.set('');
    this.contactName.set('');
    this.phone.set('');
    this.email.set('');
    this.description.set('');
  }
}
