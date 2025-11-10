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

  constructor(private soundService: SoundService) {}

  ngOnInit(): void {
    this.loadSounds();
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
    
    if (this.showTrending) {
      filtered.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }
    
    this.filteredSounds = filtered;
  }

  toggleTrending(): void {
    this.showTrending = !this.showTrending;
    this.applyFilters();
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
