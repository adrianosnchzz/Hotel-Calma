import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-cuenta.html',
  styleUrls: ['./mi-cuenta.scss']
})
export class MiCuenta implements OnInit {
  pestana: 'info' | 'reservas' = 'info';
  usuario: any = null;
  cargando = true;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    authState(this.auth).subscribe(async (user: User | null) => {
      if (user) {
        try {
          const snap = await getDoc(doc(this.firestore, 'usuarios', user.uid));
          this.usuario = snap.exists()
            ? { uid: user.uid, email: user.email, ...snap.data() }
            : { uid: user.uid, email: user.email, nombre: 'Usuario' };
        } catch (error) {
          console.error("Error al cargar datos de usuario:", error);
          this.usuario = { uid: user.uid, email: user.email, nombre: 'Usuario' };
        }
      } else {
        this.usuario = null;
      }
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  setPestana(p: 'info' | 'reservas') { 
    this.pestana = p; 
  }

  inicial(): string {
    return (this.usuario?.nombre || 'U').charAt(0).toUpperCase();
  }
}