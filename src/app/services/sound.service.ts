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
  private volume: number = 0.7;
  private fadeInterval: any = null;

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
    this.audio.volume = 0;
    this.currentPlayingId = sound.id;
    this.audio.play();
    
    this.fadeIn();
    this.incrementPlayCount(sound.id);
    
    this.audio.onended = () => {
      this.currentPlayingId = null;
    };
  }

  stop(): void {
    if (this.audio) {
      this.fadeOut(() => {
        if (this.audio) {
          this.audio.pause();
          this.audio.currentTime = 0;
          this.currentPlayingId = null;
        }
      });
    }
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.audio) {
      this.audio.volume = volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  private fadeIn(): void {
    if (!this.audio) return;
    
    let vol = 0;
    this.audio.volume = 0;
    
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    
    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        clearInterval(this.fadeInterval);
        return;
      }
      
      vol += 0.05;
      if (vol >= this.volume) {
        this.audio.volume = this.volume;
        clearInterval(this.fadeInterval);
      } else {
        this.audio.volume = vol;
      }
    }, 50);
  }

  private fadeOut(callback: () => void): void {
    if (!this.audio) {
      callback();
      return;
    }
    
    let vol = this.audio.volume;
    
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    
    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        clearInterval(this.fadeInterval);
        callback();
        return;
      }
      
      vol -= 0.05;
      if (vol <= 0) {
        this.audio.volume = 0;
        clearInterval(this.fadeInterval);
        callback();
      } else {
        this.audio.volume = vol;
      }
    }, 50);
  }

  private async incrementPlayCount(soundId: number): Promise<void> {
    try {
      await this.firebaseService.incrementPlayCount(soundId);
    } catch (error) {
      console.error('Error incrementing play count:', error);
    }
  }

  isPlaying(soundId: number): boolean {
    return this.currentPlayingId === soundId;
  }
}
