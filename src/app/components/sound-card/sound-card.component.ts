import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sound } from '../../models/sound.model';

@Component({
  selector: 'app-sound-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sound-card.component.html',
  styleUrl: './sound-card.component.css'
})
export class SoundCardComponent {
  @Input() sound!: Sound;
  @Input() isPlaying: boolean = false;
  @Input() isLooping: boolean = false;
  @Output() cardClick = new EventEmitter<Sound>();
  @Output() loopToggle = new EventEmitter<Sound>();

  onCardClick(): void {
    this.cardClick.emit(this.sound);
  }

  onLoopClick(event: Event): void {
    event.stopPropagation();
    this.loopToggle.emit(this.sound);
  }
}
