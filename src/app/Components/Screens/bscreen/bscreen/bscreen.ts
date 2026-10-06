import { Component, ElementRef, AfterViewInit, ViewChild, Type, inject } from '@angular/core';
import { ScreenService } from '../../../../Services/Pokedex/On-OFF Service/screen-service';
import { gsap } from 'gsap';
import { PokedService } from '../../../../Services/Screens/poked-screen-state';
import { BScreenPoked } from '../../../Options/Poked/BScreen/bscreen-poked/bscreen-poked';
import { CommonModule } from '@angular/common';
import { BScreenTrainer } from '../../../Options/TrainerInfo/BScreenTrainer/bscreen-trainer/bscreen-trainer';
import { BScreenPokemonSearch } from '../../../Options/PokemonSearch/BScreenPokemonSearch/bscreen-pokemon-search/bscreen-pokemon-search';

@Component({
  selector: 'app-bscreen',
  templateUrl: './bscreen.html',
  styleUrls: ['./bscreen.scss'],
  standalone: true,
  imports: [CommonModule, BScreenPoked, BScreenTrainer, BScreenPokemonSearch]
})
export class Bscreen implements AfterViewInit {
  private screenService = inject(ScreenService);
  private pokedService = inject(PokedService);

  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('pokeSplit', { static: false }) pokeSplit!: ElementRef<HTMLDivElement>;

  isOn = false;
  currentVideo = 'assets/videos/pokevid.mp4';
  currentBComponent: Type<unknown> | null = null;

  constructor() {
    this.screenService.screenState$.subscribe(state => {
      this.isOn = state;
      if (this.isOn) this.startScreen();
      else this.offScreen();
    });

    this.screenService.reset$.subscribe(() => this.resetScreenState());

    this.pokedService.state$.subscribe(data => {
      if (data.bScreenContent) this.loadBScreenContent(data.bScreenContent);
      else this.clearBScreenContent();
    });
  }

  ngAfterViewInit() {
    this.playVideo();
  }

  startScreen() {
    if (this.pokeSplit) this.pokeSplit.nativeElement.style.display = 'flex';
    setTimeout(() => this.animatePoke(), 50);
  }

  offScreen() {
    this.stopVideo();
  }

  private animatePoke() {
    if (!this.pokeSplit) return;
    const pokeSplitEl = this.pokeSplit.nativeElement;
    const top = pokeSplitEl.querySelector('.poke-top') as HTMLElement;
    const bottom = pokeSplitEl.querySelector('.poke-bottom') as HTMLElement;

    gsap.to(top, { y: '-100%', duration: 1, ease: 'power2.inOut' });
    gsap.to(bottom, {
      y: '100%',
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        pokeSplitEl.style.display = 'none';
        this.playVideo();
      }
    });
  }

  private playVideo() {
    if (!this.videoPlayer || this.currentBComponent) return;
    const video = this.videoPlayer.nativeElement;
    video.currentTime = 0;
    video.muted = true;
    video.play().catch(err => console.log('Error reproduciendo video:', err));
  }

  private stopVideo() {
    if (!this.videoPlayer) return;
    const video = this.videoPlayer.nativeElement;
    video.pause();
    video.currentTime = 0;
  }

  private loadBScreenContent(content: string) {
    switch(content) {
      case 'BScreenPoked':
        this.currentBComponent = BScreenPoked;
        this.stopVideo();
        break;
        case 'BScreenTrainer':
        this.currentBComponent = BScreenTrainer;
        this.stopVideo();
        break;
        case 'BScreenPokemonSearch':
        this.currentBComponent = BScreenPokemonSearch;
        this.stopVideo();
        break;
      default:
        this.currentBComponent = null;
        this.playVideo();
        break;
    }
  }
//BScreenPoked,BScreenTrainer,BScreenPokemonSearch
  private clearBScreenContent() {
    this.currentBComponent = null;
    this.playVideo();
  }

  private resetScreenState() {
    this.currentBComponent = null;
    this.currentVideo = 'assets/videos/pokevid.mp4';
    if (this.pokeSplit) {
      const pokeSplitEl = this.pokeSplit.nativeElement;
      pokeSplitEl.style.display = 'flex';
      const top = pokeSplitEl.querySelector('.poke-top') as HTMLElement;
      const bottom = pokeSplitEl.querySelector('.poke-bottom') as HTMLElement;
      gsap.set([top, bottom], { y: '0%' });
    }
    this.stopVideo();
  }
}
