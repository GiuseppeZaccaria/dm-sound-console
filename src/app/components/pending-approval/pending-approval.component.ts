import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-approval.component.html',
  styleUrl: './pending-approval.component.css'
})
export class PendingApprovalComponent {
  @Output() logout = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.logout.emit();
  }
}
