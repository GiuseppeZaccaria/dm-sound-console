import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Sound } from '../models/sound.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audio: HTMLAudioElement | null = null;
  private currentPlayingId: number | null = null;

  constructor(private firebaseService: FirebaseService) {}

  getSounds(): Observable<Sound[]> {
    return from(this.firebaseService.getSounds());
  }

  async addSound(sound: Omit<Sound, 'id'>): Promise<void> {
    await this.firebaseService.addSound(sound);
  }

  play(sound: Sound): void {
    if (this.audio && this.currentPlayingId === sound.id) {
      this.stop();
      return;
    }

    this.stop();
    this.audio = new Audio(sound.audioUrl);
    this.currentPlayingId = sound.id;
    this.audio.play();
    this.audio.onended = () => {
      this.currentPlayingId = null;
    };
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.currentPlayingId = null;
    }
  }

  isPlaying(soundId: number): boolean {
    return this.currentPlayingId === soundId;
  }
}
