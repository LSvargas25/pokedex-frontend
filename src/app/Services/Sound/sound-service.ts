import { Injectable } from '@angular/core';

interface ToneOptions {
  freq: number;
  duration: number;
  /** Retraso desde "ahora", en segundos. */
  start?: number;
  type?: OscillatorType;
  /** Pico de ganancia (0-1). Se mantiene bajo para que no truene. */
  gain?: number;
  /** Si se define, la frecuencia se desliza hasta este valor a lo largo de la nota. */
  slideTo?: number;
}

/**
 * Sonidos cortos generados en código con la Web Audio API — sin archivos.
 * Un único AudioContext creado de forma lazy y reutilizado (los navegadores
 * bloquean el audio hasta que hay interacción del usuario).
 */
@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private ctx: AudioContext | null = null;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) {
        return null;
      }
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Un oscilador con envolvente de ganancia (ataque rápido + decaimiento). */
  private tone(opts: ToneOptions): void {
    const ctx = this.ensureCtx();
    if (!ctx) {
      return;
    }
    const t0 = ctx.currentTime + (opts.start ?? 0);
    const dur = opts.duration;
    const peak = opts.gain ?? 0.14;

    const osc = ctx.createOscillator();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.slideTo != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), t0 + dur);
    }

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  private arpeggio(freqs: number[], step: number, type: OscillatorType = 'triangle'): void {
    freqs.forEach((freq, i) =>
      this.tone({ freq, start: i * step, duration: step + 0.08, type, gain: 0.13 })
    );
  }

  /** Tono corto neutro para clicks de UI. */
  playClick(): void {
    this.tone({ freq: 440, duration: 0.06, type: 'square', gain: 0.07 });
  }

  /** Golpe normal: tono medio con cuerpo. */
  playHit(): void {
    this.tone({ freq: 220, duration: 0.12, type: 'triangle', gain: 0.16 });
  }

  /** Crítico: dos tonos ascendentes rápidos. */
  playCrit(): void {
    this.tone({ freq: 380, duration: 0.09, type: 'square', gain: 0.14 });
    this.tone({ freq: 640, start: 0.085, duration: 0.12, type: 'square', gain: 0.14 });
  }

  /** Fallo: tono grave descendente. */
  playMiss(): void {
    this.tone({ freq: 300, duration: 0.24, type: 'sawtooth', gain: 0.09, slideTo: 90 });
  }

  /** Debilitado: tono largo descendente. */
  playFaint(): void {
    this.tone({ freq: 400, duration: 0.6, type: 'sine', gain: 0.16, slideTo: 70 });
  }

  /** Victoria: arpegio ascendente. */
  playVictory(): void {
    this.arpeggio([523, 659, 784, 1047], 0.11);
  }

  /** Derrota: arpegio descendente. */
  playDefeat(): void {
    this.arpeggio([523, 415, 330, 247], 0.14);
  }
}
