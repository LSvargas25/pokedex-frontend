import { Directive, ElementRef, OnDestroy, effect, inject, input } from '@angular/core';
import { LayoutService } from '../Services/Layout/layout';

/** Contenedores del panel de teléfono (App los renderiza con estos ids). */
export const PHONE_DOCK_IDS = { a: 'phone-dock-a', b: 'phone-dock-b' } as const;

/**
 * Mueve el elemento (una pantalla del Pokédex) al panel de teléfono mientras
 * LayoutService.docked() y lo devuelve a su lugar después. Se mueve el nodo DOM,
 * no se recrea: el componente, sus videos y su estado siguen vivos.
 */
@Directive({ selector: '[appPhoneDock]' })
export class PhoneDock implements OnDestroy {
  readonly slot = input.required<keyof typeof PHONE_DOCK_IDS>({ alias: 'appPhoneDock' });

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly layout = inject(LayoutService);
  private placeholder: Comment | null = null;

  constructor() {
    effect(() => {
      const docked = this.layout.docked();
      const slot = this.slot();
      // Después del render: el panel de App ya existe en el DOM.
      requestAnimationFrame(() => (docked ? this.dock(slot) : this.undock()));
    });
  }

  private dock(slot: keyof typeof PHONE_DOCK_IDS): void {
    const target = document.getElementById(PHONE_DOCK_IDS[slot]);
    if (!target || this.el.parentElement === target) return;
    if (!this.placeholder) {
      this.placeholder = document.createComment('phone-dock');
      this.el.before(this.placeholder);
    }
    target.appendChild(this.el);
  }

  private undock(): void {
    if (!this.placeholder) return;
    this.placeholder.after(this.el);
    this.placeholder.remove();
    this.placeholder = null;
  }

  ngOnDestroy(): void {
    this.undock();
  }
}
