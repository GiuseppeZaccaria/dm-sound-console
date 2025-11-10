import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundCardComponent } from './components/sound-card/sound-card.component';
import { UploadModalComponent } from './components/upload-modal/upload-modal.component';
import { SoundService } from './services/sound.service';
import { Sound } from './models/sound.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SoundCardComponent, UploadModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  sounds: Sound[] = [];
  showUploadModal: boolean = false;

  constructor(private soundService: SoundService) {}

  ngOnInit(): void {
    this.soundService.getSounds().subscribe(sounds => {
      this.sounds = sounds;
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
    this.soundService.getSounds().subscribe(sounds => {
      this.sounds = sounds;
    });
  }
}
