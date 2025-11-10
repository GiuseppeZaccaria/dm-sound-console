import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, Auth, User, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    const app = getApp();
    this.auth = getAuth(app);
    
    // Set persistence to local storage (persists across browser sessions)
    setPersistence(this.auth, browserLocalPersistence);
    
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      
      // Set expiration timestamp (3 days from now)
      if (user) {
        const expirationTime = Date.now() + (3 * 24 * 60 * 60 * 1000); // 3 days
        localStorage.setItem('authExpiration', expirationTime.toString());
      } else {
        localStorage.removeItem('authExpiration');
      }
    });
    
    // Check if auth has expired on init
    this.checkAuthExpiration();
  }

  private checkAuthExpiration(): void {
    const expiration = localStorage.getItem('authExpiration');
    if (expiration && Date.now() > parseInt(expiration)) {
      this.logout();
    }
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.email) return false;
    
    const adminEmails = [
      '3bzaccaria.giuseppe@gmail.com', // Sostituisci con la tua email
    ];
    
    return adminEmails.includes(user.email);
  }
}
