import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Sound } from '../../models/sound.model';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.css'
})
export class EditModalComponent implements OnInit {
  @Input() sound!: Sound;
  @Output() close = new EventEmitter<void>();
  @Output() soundUpdated = new EventEmitter<Sound>();

  title: string = '';
  imageFile: File | null = null;
  audioFile: File | null = null;
  uploading: boolean = false;
  uploadProgress: string = '';

  private cloudName = 'digu51dei';
  private uploadPreset = 'g34lxkn3';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.title = this.sound.title;
  }

  onImageSelect(event: any): void {
    this.imageFile = event.target.files[0];
  }

  onAudioSelect(event: any): void {
    this.audioFile = event.target.files[0];
  }

  async onSubmit(): Promise<void> {
    if (!this.title.trim()) {
      alert('Inserisci un titolo!');
      return;
    }

    this.uploading = true;
    
    try {
      let imageUrl = this.sound.imageUrl;
      let audioUrl = this.sound.audioUrl;

      if (this.imageFile) {
        this.uploadProgress = 'Caricamento immagine...';
        imageUrl = await this.uploadToCloudinary(this.imageFile, 'image');
      }

      if (this.audioFile) {
        this.uploadProgress = 'Caricamento audio...';
        audioUrl = await this.uploadToCloudinary(this.audioFile, 'video');
      }
      
      this.uploadProgress = 'Salvataggio...';
      
      const updatedSound: Sound = {
        ...this.sound,
        title: this.title.trim(),
        imageUrl,
        audioUrl
      };

      this.soundUpdated.emit(updatedSound);
      this.closeModal();
    } catch (error) {
      alert('Errore durante il caricamento');
      console.error(error);
    } finally {
      this.uploading = false;
      this.uploadProgress = '';
    }
  }

  private uploadToCloudinary(file: File, resourceType: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;

    return new Promise((resolve, reject) => {
      this.http.post<any>(url, formData).subscribe({
        next: (response) => resolve(response.secure_url),
        error: (error) => reject(error)
      });
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
