import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementService, PendingUser } from '../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  allUsers: PendingUser[] = [];
  loading: boolean = true;

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  async loadAllUsers(): Promise<void> {
    this.loading = true;
    try {
      this.allUsers = await this.userManagementService.getAllUsers();
      console.log('🔍 UTENTI CARICATI DALLA DASHBOARD:', this.allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  async changeStatus(user: PendingUser, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    if (!user.docId) return;
    
    try {
      await this.userManagementService.updateUserStatus(user.docId, status);
      alert(`Status cambiato a ${status}!`);
      this.loadAllUsers();
    } catch (error) {
      alert('Errore durante il cambio status');
      console.error(error);
    }
  }

  async deleteUser(user: PendingUser): Promise<void> {
    if (!user.docId) return;
    
    if (!confirm(`Vuoi eliminare ${user.displayName}?`)) return;
    
    try {
      await this.userManagementService.deleteUser(user.docId);
      alert(`${user.displayName} eliminato!`);
      this.loadAllUsers();
    } catch (error) {
      alert('Errore durante l\'eliminazione');
      console.error(error);
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'approved': return '#1ed760';
      case 'pending': return '#ffa500';
      case 'rejected': return '#ff4444';
      default: return '#888';
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('it-IT');
  }
}
