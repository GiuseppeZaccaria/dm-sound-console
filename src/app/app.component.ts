import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoundCardComponent } from './components/sound-card/sound-card.component';
import { UploadModalComponent } from './components/upload-modal/upload-modal.component';
import { SoundService } from './services/sound.service';
import { Sound } from './models/sound.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, SoundCardComponent, UploadModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  sounds: Sound[] = [];
  filteredSounds: Sound[] = [];
  showUploadModal: boolean = false;
  searchQuery: string = '';
  showTrending: boolean = false;
  gridSize: 'small' | 'medium' | 'large' = 'medium';
  sortBy: 'name' | 'playCount' | 'date' = 'date';
  playbackSpeed: number = 1;
  showControls: boolean = false;
  pitch: number = 0;
  theme: 'green' | 'purple' | 'blue' | 'red' = 'green';
  autoPlayNext: boolean = false;
  shuffleMode: boolean = false;

  constructor(private soundService: SoundService) {}

  ngOnInit(): void {
    this.loadSounds();
    this.playbackSpeed = this.soundService.getSpeed();
    this.pitch = this.soundService.getPitch();
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  loadSounds(): void {
    this.soundService.getSounds().subscribe(sounds => {
      this.sounds = sounds;
      this.applyFilters();
    });
  }

  onSoundClick(sound: Sound): void {
    this.soundService.play(sound);
    
    if (this.autoPlayNext) {
      this.soundService.onSoundEnded(() => {
        this.playNextSound();
      });
    }
  }

  playNextSound(): void {
    const currentIndex = this.filteredSounds.findIndex(s => this.isPlaying(s.id));
    let nextIndex: number;
    
    if (this.shuffleMode) {
      nextIndex = Math.floor(Math.random() * this.filteredSounds.length);
    } else {
      nextIndex = (currentIndex + 1) % this.filteredSounds.length;
    }
    
    if (this.filteredSounds[nextIndex]) {
      setTimeout(() => {
        this.onSoundClick(this.filteredSounds[nextIndex]);
      }, 500);
    }
  }

  isPlaying(soundId: number): boolean {
    return this.soundService.isPlaying(soundId);
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
  }

  onSoundAdded(): void {
    this.loadSounds();
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.sounds];
    
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(sound => 
        sound.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (this.showTrending || this.sortBy === 'playCount') {
      filtered.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (this.sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === 'date') {
      filtered.sort((a, b) => b.id - a.id);
    }
    
    this.filteredSounds = filtered;
  }

  toggleTrending(): void {
    this.showTrending = !this.showTrending;
    this.applyFilters();
  }

  toggleControls(): void {
    this.showControls = !this.showControls;
  }

  setGridSize(size: 'small' | 'medium' | 'large'): void {
    this.gridSize = size;
  }

  setSortBy(sort: 'name' | 'playCount' | 'date'): void {
    this.sortBy = sort;
    this.applyFilters();
  }

  setSpeed(speed: number): void {
    this.playbackSpeed = speed;
    this.soundService.setSpeed(speed);
  }

  setPitch(pitch: number): void {
    this.pitch = pitch;
    this.soundService.setPitch(pitch);
    
    // Restart current sound if playing
    const playingSound = this.filteredSounds.find(s => this.isPlaying(s.id));
    if (playingSound) {
      this.soundService.stop();
      this.onSoundClick(playingSound);
    }
  }

  setTheme(theme: 'green' | 'purple' | 'blue' | 'red'): void {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleAutoPlay(): void {
    this.autoPlayNext = !this.autoPlayNext;
  }

  toggleShuffle(): void {
    this.shuffleMode = !this.shuffleMode;
  }

  toggleLoop(sound: Sound): void {
    const wasPlaying = this.isPlaying(sound.id);
    sound.isLooping = !sound.isLooping;
    
    if (wasPlaying) {
      this.soundService.stop();
      this.onSoundClick(sound);
    }
  }

  isLooping(soundId: number): boolean {
    const loopingSound = this.soundService.getLoopingSound();
    return loopingSound?.id === soundId;
  }

  handleKeyPress(event: KeyboardEvent): void {
    const key = parseInt(event.key);
    if (key >= 1 && key <= 9) {
      const index = key - 1;
      if (this.filteredSounds[index]) {
        this.onSoundClick(this.filteredSounds[index]);
      }
    }
  }
}
