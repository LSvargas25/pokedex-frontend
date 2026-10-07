import { Component, inject } from '@angular/core';
import { AuthService } from '../../Services/Auth/auth-service';

/** Aviso pequeño, abajo, mientras se juega con una sesión anónima. */
@Component({
  selector: 'app-guest-notice',
  template: `
    @if (isAnonymous()) {
      <p class="guest-notice" role="status">
        Estás jugando como invitado: tu progreso se pierde si cierras sesión
      </p>
    }
  `,
  styles: `
    .guest-notice {
      position: fixed;
      left: 50%;
      bottom: 12px;
      z-index: 100000;
      transform: translateX(-50%);
      box-sizing: border-box;
      max-width: calc(100vw - 32px);
      margin: 0;
      padding: 6px 14px;
      font: 13px/1.4 system-ui, sans-serif;
      text-align: center;
      color: #1f2937;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #d1d5db;
      border-radius: 999px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    /* Celular: fijo abajo tapaba los botones del combate; va arriba, en el flujo. */
    @media (max-width: 699px) {
      .guest-notice {
        position: static;
        transform: none;
        max-width: none;
        border-radius: 0;
        border-width: 0 0 1px;
        box-shadow: none;
      }
    }
  `,
})
export class GuestNotice {
  protected readonly isAnonymous = inject(AuthService).isAnonymous;
}
