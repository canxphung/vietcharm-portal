import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideChevronDown, LucideMail, LucideMapPin, LucidePhone } from '@lucide/angular';
import { I18nService } from '@/services/i18n.service';
import { SUPPORT_TOPICS, SUPPORT_TOPIC_ORDER, type SupportTopicId } from './support-content';

@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [RouterLink, LucideChevronDown, LucideMail, LucideMapPin, LucidePhone],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  private readonly route = inject(ActivatedRoute);
  readonly i18n = inject(I18nService);
  readonly topicOrder = SUPPORT_TOPIC_ORDER;
  readonly SUPPORT_TOPICS = SUPPORT_TOPICS;
  readonly openFaq = signal<string | null>(null);

  private readonly params = toSignal(this.route.paramMap);
  readonly topicId = computed<SupportTopicId>(() => {
    const raw = this.params()?.get('topic') ?? 'help';
    return raw in SUPPORT_TOPICS ? (raw as SupportTopicId) : 'help';
  });
  readonly topic = computed(() => SUPPORT_TOPICS[this.topicId()]);

  groupTopics(group: 'first' | 'second'): SupportTopicId[] {
    return this.topicOrder.filter((id) => (SUPPORT_TOPICS[id].groupVi === 'Hỗ trợ') === (group === 'first'));
  }

  toggleFaq(question: string): void {
    this.openFaq.update((current) => (current === question ? null : question));
  }
}
