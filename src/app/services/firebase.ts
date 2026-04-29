import { Injectable, inject } from '@angular/core';

import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: Firestore = inject(Firestore);

  async getHabitaciones(): Promise<any[]> {
   
    const habitacionesRef = collection(this.firestore, 'habitaciones');
    const snapshot = await getDocs(habitacionesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}