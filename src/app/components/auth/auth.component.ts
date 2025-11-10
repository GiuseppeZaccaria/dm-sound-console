import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLogin: boolean = true;
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private authService: AuthService) {}

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.error = '';
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.error = 'Compila tutti i campi';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      if (this.isLogin) {
        await this.authService.login(this.email, this.password);
      } else {
        await this.authService.register(this.email, this.password);
      }
    } catch (error: any) {
      this.error = this.getErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      this.error = this.getErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Email non valida';
      case 'auth/user-not-found':
        return 'Utente non trovato';
      case 'auth/wrong-password':
        return 'Password errata';
      case 'auth/email-already-in-use':
        return 'Email già registrata';
      case 'auth/weak-password':
        return 'Password troppo debole (min 6 caratteri)';
      default:
        return 'Errore durante l\'autenticazione';
    }
  }
}
