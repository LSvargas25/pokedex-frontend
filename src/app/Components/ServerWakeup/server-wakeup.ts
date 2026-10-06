import { Component, inject } from '@angular/core';
import { ServerStatusService } from '../../Services/ServerStatus/server-status';

/** Aviso fijo arriba mientras el backend (Render, plan gratuito) despierta. */
@Component({
  selector: 'app-server-wakeup',
  templateUrl: './server-wakeup.html',
  styleUrl: './server-wakeup.scss',
})
export class ServerWakeup {
  protected readonly status = inject(ServerStatusService).status;

  protected reload(): void {
    window.location.reload();
  }
}
