import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Firestore } from 'firebase/firestore';
import { Sound } from '../models/sound.model';

const firebaseConfig = {
  apiKey: "AIzaSyAoQp581RaE9XLsBxzM-P51qzQkuyXplvE",
  authDomain: "dm-data-console.firebaseapp.com",
  projectId: "dm-data-console",
  storageBucket: "dm-data-console.firebasestorage.app",
  messagingSenderId: "678603646785",
  appId: "1:678603646785:web:21a68f2b848c2e557223c0",
  measurementId: "G-Y6SRNGRMWP"
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: Firestore;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  async getSounds(): Promise<Sound[]> {
    const soundsCol = collection(this.db, 'sounds');
    const soundsSnapshot = await getDocs(soundsCol);
    return soundsSnapshot.docs.map(doc => ({
      id: doc.data()['id'],
      title: doc.data()['title'],
      audioUrl: doc.data()['audioUrl'],
      imageUrl: doc.data()['imageUrl']
    }));
  }

  async addSound(sound: Omit<Sound, 'id'>): Promise<void> {
    const soundsCol = collection(this.db, 'sounds');
    const newSound = {
      ...sound,
      id: Date.now()
    };
    await addDoc(soundsCol, newSound);
  }
}
