import { Component, ViewChild, ElementRef, AfterViewInit, Type, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { ScreenService } from '../../../Services/Pokedex/On-OFF Service/screen-service';
import { PokedService } from '../../../Services/Screens/poked-screen-state';
import { AscreenPoked } from '../../Options/Poked/AScreen/ascreen-poked/ascreen-poked';
import { AScreenPokemonSearch } from '../../Options/PokemonSearch/AScreenPokemonSearch/ascreen-pokemon-search/ascreen-pokemon-search';
import { TrainerPanel } from '../../TrainerInfo/TrainerPanel/trainer-panel';
import { Settings } from '../../Options/Settings/Settings/settings';
import { PokemonSelected } from '../../../Services/Options/SearchPokemon/PokemonSelected/pokemon-selected';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-ascreen',
  standalone: true,
  imports: [CommonModule, FormsModule, AscreenPoked,Settings],
  templateUrl: './ascreen.html',
  styleUrls: ['./ascreen.scss']
})
export class AScreen implements AfterViewInit, OnDestroy {
  private screenService = inject(ScreenService);
  private pokedService = inject(PokedService);
  private pokemonSelected = inject(PokemonSelected);

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('blackSplit') blackSplit!: ElementRef<HTMLDivElement>;

  isOn = false;
  showMenu = false;
  showBackDiv = false
  currentComponent: Type<unknown> | null = null; // componente dinámico
  currentVideo = 'assets/videos/intro.mp4';
  options = ['Poked', 'Pokémon Search', 'Trainer Info', 'Settings'];
  showBack = false;

  volume = 0.3;
  isMuted = false;
  volumeIcon = '🔉';

  private destroy$ = new Subject<void>();
  forceSilence = false; // audio solo en menú (si el usuario no está muteado)

  constructor() {
    this.screenService.screenState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state && !this.isOn) this.startScreen();
        else if (!state && this.isOn) this.stopScreen();
        this.isOn = state;
      });

    this.screenService.reset$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.resetScreenState());

    this.pokedService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data.aScreenContent) this.loadAScreenContent(data.aScreenContent);
        else this.clearAScreenContent();
      });

    // Volver al menú cuando lo pide otra pantalla (ej. la B al terminar una batalla).
    this.pokedService.menu$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.goBack());
  }

  ngAfterViewInit() {
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.volume = this.volume;
      this.videoPlayer.nativeElement.muted = this.isMuted;
    }
    this.updateVolumeIcon();
  }

  ngOnDestroy() {
    this.stopAllVideos();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**Animación de encendido (abrir la cortina) */
  private startScreen() {
    this.showMenu = false;
    this.currentVideo = 'assets/videos/intro.mp4';
    const splitEl = this.blackSplit.nativeElement;
    const top = splitEl.querySelector('.black-top') as HTMLElement;
    const bottom = splitEl.querySelector('.black-bottom') as HTMLElement;

    gsap.set(top, { y: '0%' });
    gsap.set(bottom, { y: '0%' });
    splitEl.style.display = 'flex';

    gsap.to(top, { y: '-100%', duration: 1, ease: 'power2.inOut' });
    gsap.to(bottom, {
      y: '100%',
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        splitEl.style.display = 'none';
        this.playVideo();
      }
    });
  }

  /** 🔴 Animación de apagado (cerrar cortina) */
  private stopScreen() {
    this.showBackDiv = false;
    this.currentComponent = null;
    this.currentVideo = '';
    this.pokemonSelected.reset(); // Resetear pokemon seleccionado

    this.stopAllVideos(); // <- asegura que nada quede sonando

    const splitEl = this.blackSplit.nativeElement;
    const top = splitEl.querySelector('.black-top') as HTMLElement;
    const bottom = splitEl.querySelector('.black-bottom') as HTMLElement;

    splitEl.style.display = 'flex';
    gsap.set(top, { y: '-100%' });
    gsap.set(bottom, { y: '100%' });

    gsap.to(top, { y: '0%', duration: 1, ease: 'power2.inOut' });
    gsap.to(bottom, {
      y: '0%',
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => this.finishPowerOff()
    });
  }

  private finishPowerOff() {
    const video = this.videoPlayer?.nativeElement;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    console.log('💤 Pantalla apagada');
  }

  private playVideo() {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.currentTime = 0;
    video.volume = this.volume;
    video.muted = this.isMuted || this.forceSilence; // usar silencio efectivo
    video.play();
    this.applyVolumeToAllVideos();
  }

  private stopAllVideos() {
    document.querySelectorAll('video').forEach(v => {
      try {
        v.pause();
        v.currentTime = 0;
      } catch {
        // el video puede no estar listo todavía
      }
    });
  }

  private applyVolumeToAllVideos() {
    const vol = this.isMuted ? 0 : this.volume;
    const muted = this.isMuted || this.forceSilence || vol === 0;
    document.querySelectorAll('video').forEach(v => {
      try {
        v.muted = muted;
        v.volume = muted ? 0 : vol;
      } catch {
        // el video puede no estar listo todavía
      }
    });
  }

  private resetScreenState() {
    this.showMenu = false;
    this.showBack = false;
    this.currentComponent = null;
    this.currentVideo = 'assets/videos/intro.mp4';
    const splitEl = this.blackSplit.nativeElement;
    splitEl.style.display = 'flex';
    const top = splitEl.querySelector('.black-top') as HTMLElement;
    const bottom = splitEl.querySelector('.black-bottom') as HTMLElement;
    gsap.set([top, bottom], { y: '0%' });

    const video = this.videoPlayer?.nativeElement;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    console.log('🔄 Pokedex reiniciada completamente');
  }

  onVideoEnded() {
    if (!this.showMenu) {
      this.showMenu = true;
      this.forceSilence = false; // al mostrar menú, permitir sonido si no está muteado
      this.currentVideo = 'assets/videos/pikachu.mp4';
      setTimeout(() => this.playVideo(), 0);
    }
  }

  // 🔹 Cargar componente dinámico según el servicio
  private loadAScreenContent(content: string) {
    switch(content) {
      case 'Poked':
        this.currentComponent = AscreenPoked;
        break;
         case 'Pokémon Search':
        this.currentComponent = AScreenPokemonSearch;
        break;
      case 'Trainer Info':
        this.currentComponent = TrainerPanel;
        break;
      case 'Settings':
        this.currentComponent = Settings;
        break;
      default:
        this.currentComponent = null;
        break;
    }
  }

  private clearAScreenContent() {
    this.currentComponent = null;
  }

  onOptionClick(option: string) {
    this.showMenu = false;
    this.showBack = true;
    this.showBackDiv = true;

    this.stopAllVideos();

    // silenciar todo fuera del menú sin modificar el mute del usuario
    this.forceSilence = true;
    this.applyVolumeToAllVideos();

    const video = this.videoPlayer?.nativeElement;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    this.currentVideo = '';

    switch(option) {
      case 'Poked':
        this.currentComponent = AscreenPoked;
        this.pokedService.setScreens('Poked', 'BScreenPoked');
        break;
      case 'Pokémon Search':
        this.currentComponent = AScreenPokemonSearch;
        this.pokedService.setScreens('Pokémon Search', 'BScreenPokemonSearch');
        break;
      case 'Trainer Info':
        this.currentComponent = TrainerPanel;
        this.pokedService.setScreens('Trainer Info', 'BScreenTrainer');
        break;
      case 'Settings':
        this.currentComponent = Settings;
        this.pokedService.setScreens('Settings', null);
        break;
    }
  }

  goBack() {
    this.pokedService.reset();
    this.pokemonSelected.reset();
    this.currentComponent = null;
    this.showBack = false;
    this.showBackDiv = false;

    this.forceSilence = false; // al volver al menú, permitir sonido si no está muteado
    this.showMenu = true;
    this.currentVideo = 'assets/videos/pikachu.mp4';
    setTimeout(() => this.playVideo(), 0);
  }

  toggleMute() {
    const video = this.videoPlayer?.nativeElement;
    if (this.isMuted || this.volume === 0) {
      this.isMuted = false;
      this.volume = 0.3;
      if (video) {
        video.muted = false;
        video.volume = this.volume;
      }
    } else {
      this.isMuted = true;
      this.volume = 0;
      if (video) video.muted = true;
    }
    this.applyVolumeToAllVideos(); // <- aplica a cualquier <video> activo
    this.updateVolumeIcon(true);
  }

  changeVolume() {
    const video = this.videoPlayer?.nativeElement;
    if (video) video.volume = this.volume;
    this.isMuted = this.volume === 0;
    if (video) video.muted = this.isMuted;
    this.applyVolumeToAllVideos(); // <- aplica a cualquier <video> activo
    this.updateVolumeIcon(true);
  }

  private updateVolumeIcon(animated = false) {
    if (this.isMuted || this.volume === 0) this.volumeIcon = '🔇';
    else if (this.volume < 0.3) this.volumeIcon = '🔈';
    else if (this.volume < 0.7) this.volumeIcon = '🔉';
    else this.volumeIcon = '🔊';

    if (animated) {
      const icon = document.querySelector('.volume-icon');
      if (icon) {
        icon.classList.add('bounce');
        setTimeout(() => icon.classList.remove('bounce'), 300);
      }
    }
  }
}
