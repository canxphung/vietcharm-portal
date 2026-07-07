import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

/**
 * Scroll-reveal: the host starts hidden (translated + faded) and rises into place
 * the first time it enters the viewport. Mirrors the React `Reveal` component.
 *
 * Usage: `<div reveal>` or `<div reveal [revealDelay]="120">` (delay in ms).
 */
@Directive({
  selector: '[reveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  readonly revealDelay = input(0);

  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement as HTMLElement;
    el.classList.add('reveal');
    if (this.revealDelay()) el.style.animationDelay = `${this.revealDelay()}ms`;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
