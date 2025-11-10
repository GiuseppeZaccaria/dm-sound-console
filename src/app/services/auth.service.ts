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
      
      if (user) {
        const expirationTime = Date.now() + (3 * 24 * 60 * 60 * 1000);
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
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const userExists = await this.checkIfUserExists(userCredential.user.uid);
    if (!userExists) {
      await this.createPendingUser(userCredential.user);
    }
  }

  async register(email: string, password: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.createPendingUser(userCredential.user);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    
    const userExists = await this.checkIfUserExists(result.user.uid);
    if (!userExists) {
      await this.createPendingUser(result.user);
    }
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
    return this.adminEmails.includes(user.email);
  }

  private async createPendingUser(user: any): Promise<void> {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    const app = getApp();
    const db = getFirestore(app);
    
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
      status: 'pending',
      createdAt: Date.now()
    });
  }

  private async checkIfUserExists(uid: string): Promise<boolean> {
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    const app = getApp();
    const db = getFirestore(app);
    
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('uid', '==', uid));
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  }

  async getUserStatus(uid: string): Promise<string> {
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    const app = getApp();
    const db = getFirestore(app);
    
    // Retry fino a 3 volte per gestire race condition
    for (let i = 0; i < 3; i++) {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where('uid', '==', uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data()['status'] || 'pending';
      }
      
      // Aspetta 500ms prima di riprovare
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Se dopo 3 tentativi non trova il record, crea l'utente
    const user = this.getCurrentUser();
    if (user) {
      await this.createPendingUser(user);
    }
    return 'pending';
  }

  async getAllUsers(): Promise<any[]> {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    const app = getApp();
    const db = getFirestore(app);
    
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private adminEmails = [
    '3bzaccaria.giuseppe@gmail.com',
  ];
}
