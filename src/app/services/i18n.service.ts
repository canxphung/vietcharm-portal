import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { dictionaries, type Dictionary } from '@/locales';
import type { Language } from '@/types';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  readonly language = signal<Language>('vi');
  readonly dictionary = computed<Dictionary>(() => dictionaries[this.language()]);
  readonly isVi = computed(() => this.language() === 'vi');

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.language();
    });
  }

  setLanguage(language: Language): void {
    this.language.set(language);
  }

  toggleLanguage(): void {
    this.language.update((language) => (language === 'vi' ? 'en' : 'vi'));
  }
}
