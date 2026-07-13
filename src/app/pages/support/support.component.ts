import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideChevronDown, LucideMail, LucideMapPin, LucidePhone } from '@lucide/angular';
import { ContentService } from '@/services/content.service';
import { I18nService } from '@/services/i18n.service';
import type { SupportTopic, SupportTopicId } from '@/types';

const DEFAULT_TOPIC: SupportTopicId = 'help';

@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [RouterLink, LucideChevronDown, LucideMail, LucideMapPin, LucidePhone],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  readonly i18n = inject(I18nService);
  readonly topics = this.content.supportTopics;
  readonly loading = this.content.supportTopicsLoading;
  readonly openFaq = signal<string | null>(null);

  private readonly params = toSignal(this.route.paramMap);
  readonly topicId = computed(
    () => (this.params()?.get('topic') ?? DEFAULT_TOPIC) as SupportTopicId,
  );
  readonly topic = computed(
    () => this.topics().find((topic) => topic.id === this.topicId()) ?? this.topics()[0] ?? null,
  );

  groupTopics(group: SupportTopic['group']): SupportTopic[] {
    return this.topics().filter((topic) => topic.group === group);
  }

  toggleFaq(question: string): void {
    this.openFaq.update((current) => (current === question ? null : question));
  }
}
