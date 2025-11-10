import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, Firestore } from 'firebase/firestore';

export interface PendingUser {
  uid: string;
  email: string;
  displayName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  docId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private db: Firestore;

  constructor() {
    const app = getApp();
    this.db = getFirestore(app);
  }

  async getPendingUsers(): Promise<PendingUser[]> {
    const usersCol = collection(this.db, 'users');
    const q = query(usersCol, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data() as PendingUser,
      docId: doc.id
    }));
  }

  async getAllUsers(): Promise<PendingUser[]> {
    const usersCol = collection(this.db, 'users');
    const snapshot = await getDocs(usersCol);
    
    return snapshot.docs.map(doc => ({
      ...doc.data() as PendingUser,
      docId: doc.id
    }));
  }

  async updateUserStatus(docId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    const usersCol = collection(this.db, 'users');
    const snapshot = await getDocs(usersCol);
    const doc = snapshot.docs.find(d => d.id === docId);
    
    if (doc) {
      await updateDoc(doc.ref, { status });
    }
  }

  async deleteUser(docId: string): Promise<void> {
    const { deleteDoc } = await import('firebase/firestore');
    const usersCol = collection(this.db, 'users');
    const snapshot = await getDocs(usersCol);
    const doc = snapshot.docs.find(d => d.id === docId);
    
    if (doc) {
      await deleteDoc(doc.ref);
    }
  }

  async approveUser(docId: string): Promise<void> {
    const usersCol = collection(this.db, 'users');
    const snapshot = await getDocs(usersCol);
    const doc = snapshot.docs.find(d => d.id === docId);
    
    if (doc) {
      await updateDoc(doc.ref, { status: 'approved' });
    }
  }

  async rejectUser(docId: string): Promise<void> {
    const usersCol = collection(this.db, 'users');
    const snapshot = await getDocs(usersCol);
    const doc = snapshot.docs.find(d => d.id === docId);
    
    if (doc) {
      await updateDoc(doc.ref, { status: 'rejected' });
    }
  }
}
