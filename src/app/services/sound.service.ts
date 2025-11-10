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
  private playbackSpeed: number = 1;
  private loopingSound: Sound | null = null;
  private pitch: number = 0;
  private endCallback: (() => void) | null = null;

  constructor(private firebaseService: FirebaseService) {}

  getSounds(): Observable<Sound[]> {
    return from(this.firebaseService.getSounds());
  }

  async addSound(sound: Omit<Sound, 'id'>, userId: string): Promise<void> {
    await this.firebaseService.addSound(sound, userId);
  }

  async updateSound(sound: Sound): Promise<void> {
    await this.firebaseService.updateSound(sound);
  }

  async deleteSound(soundId: number): Promise<void> {
    await this.firebaseService.deleteSound(soundId);
  }

  play(sound: Sound): void {
    if (this.audio && this.currentPlayingId === sound.id) {
      this.stop();
      return;
    }

    this.stop();
    
    if (sound.isLooping) {
      this.loopingSound = sound;
    } else {
      this.loopingSound = null;
    }
    
    this.audio = new Audio(sound.audioUrl);
    this.audio.volume = 0;
    this.audio.loop = sound.isLooping || false;
    this.currentPlayingId = sound.id;
    
    this.applyAudioEffects();
    
    this.audio.play().then(() => {
      // Increment only if play was successful
      this.incrementPlayCount(sound.id);
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
    
    this.fadeIn();
    
    this.audio.onended = () => {
      if (!this.audio?.loop) {
        this.currentPlayingId = null;
        this.loopingSound = null;
        if (this.endCallback) {
          this.endCallback();
        }
      }
    };
  }

  stop(): void {
    if (this.audio) {
      if (this.fadeInterval) clearInterval(this.fadeInterval);
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
      this.currentPlayingId = null;
      this.loopingSound = null;
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

  setSpeed(speed: number): void {
    this.playbackSpeed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
  }

  getSpeed(): number {
    return this.playbackSpeed;
  }

  getLoopingSound(): Sound | null {
    return this.loopingSound;
  }

  setPitch(pitch: number): void {
    this.pitch = pitch;
  }

  getPitch(): number {
    return this.pitch;
  }

  onSoundEnded(callback: () => void): void {
    this.endCallback = callback;
  }

  private applyAudioEffects(): void {
    if (!this.audio) return;
    
    const pitchShift = Math.pow(2, this.pitch / 12);
    this.audio.playbackRate = this.playbackSpeed * pitchShift;
    this.audio.preservesPitch = false;
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
