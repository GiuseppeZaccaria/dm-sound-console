import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-modal.component.html',
  styleUrl: './upload-modal.component.css'
})
export class UploadModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() soundAdded = new EventEmitter<void>();

  password: string = '';
  isAuthenticated: boolean = false;
  title: string = '';
  imageFile: File | null = null;
  audioFile: File | null = null;
  uploading: boolean = false;
  uploadProgress: string = '';
  
  private readonly correctPassword = 'hodeiticmade';

  private cloudName = 'digu51dei';
  private uploadPreset = 'g34lxkn3';

  constructor(private http: HttpClient, private soundService: SoundService) {}

  checkPassword(): void {
    if (this.password === this.correctPassword) {
      this.isAuthenticated = true;
    } else {
      alert('Password errata!');
      this.password = '';
    }
  }

  onImageSelect(event: any): void {
    this.imageFile = event.target.files[0];
  }

  onAudioSelect(event: any): void {
    this.audioFile = event.target.files[0];
  }

  async onSubmit(): Promise<void> {
    if (!this.title || !this.imageFile || !this.audioFile) {
      alert('Compila tutti i campi!');
      return;
    }

    this.uploading = true;
    
    try {
      this.uploadProgress = 'Caricamento immagine...';
      const imageUrl = await this.uploadToCloudinary(this.imageFile, 'image');
      
      this.uploadProgress = 'Caricamento audio...';
      const audioUrl = await this.uploadToCloudinary(this.audioFile, 'video');
      
      this.uploadProgress = 'Salvataggio...';
      await this.saveToJson(imageUrl, audioUrl);
      
      alert('Suono caricato con successo!');
      this.resetForm();
      this.soundAdded.emit();
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

  private async saveToJson(imageUrl: string, audioUrl: string): Promise<void> {
    await this.soundService.addSound({
      title: this.title,
      audioUrl,
      imageUrl
    });
  }

  closeModal(): void {
    this.resetForm();
    this.close.emit();
  }

  private resetForm(): void {
    this.title = '';
    this.imageFile = null;
    this.audioFile = null;
    this.password = '';
    this.isAuthenticated = false;
  }
}
