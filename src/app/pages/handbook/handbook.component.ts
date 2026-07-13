import { Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '@/services/content.service';
import { I18nService } from '@/services/i18n.service';

@Component({
  selector: 'app-handbook-page',
  standalone: true,
  imports: [],
  templateUrl: './handbook.component.html',
  styleUrl: './handbook.component.css',
})
export class HandbookComponent {
  private readonly content = inject(ContentService);
  readonly activeTab = signal('history');
  readonly entries = this.content.handbookEntries;
  readonly loading = this.content.handbookLoading;
  readonly active = computed(
    () =>
      this.entries().find((entry) => entry.id === this.activeTab()) ?? this.entries()[0] ?? null,
  );
  readonly tabs = computed(() =>
    this.entries().map((entry) => ({
      id: entry.id,
      label: this.i18n.isVi() ? entry.labelVi : entry.labelEn,
    })),
  );

  constructor(readonly i18n: I18nService) {}
}
