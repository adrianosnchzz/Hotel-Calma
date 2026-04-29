import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  authState,
  signOut,
  User
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss']
})
export class AuthComponent implements OnInit {
  modalAbierto = false;
  esLogin = true;
  usuarioLogueado: any = null;
  usuario = { email: '', password: '', nombre: '', dni: '' };

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    authState(this.auth).subscribe(async (user: User | null) => {
      if (user) {
        try {
          const docRef = doc(this.firestore, 'usuarios', user.uid);
          const docSnap = await getDoc(docRef);
          this.usuarioLogueado = docSnap.exists()
            ? docSnap.data()
            : { nombre: 'Usuario' };
        } catch (e) {
          console.error('Error al obtener datos del usuario:', e);
          this.usuarioLogueado = { nombre: 'Usuario' };
        }
      } else {
        this.usuarioLogueado = null;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {}

  abrirModal() { this.modalAbierto = true; }
  cerrarModal() { this.modalAbierto = false; }
  cambiarModo() { this.esLogin = !this.esLogin; }

  async logout() {
    await signOut(this.auth);
    this.usuarioLogueado = null;
    this.cdr.detectChanges();
  }

  async confirmar() {
    try {
      if (this.esLogin) {
        await signInWithEmailAndPassword(this.auth, this.usuario.email, this.usuario.password);
      } else {
        const credencial = await createUserWithEmailAndPassword(
          this.auth, this.usuario.email, this.usuario.password
        );
        await setDoc(doc(this.firestore, 'usuarios', credencial.user.uid), {
          nombre: this.usuario.nombre,
          dni: this.usuario.dni,
          email: this.usuario.email,
          rol: 'cliente'
        });
      }

      this.cerrarModal();
      this.usuario = { email: '', password: '', nombre: '', dni: '' };
      this.router.navigate(['/']);

    } catch (error: any) {
      console.error('Error de autenticación:', error);
      if (error.code === 'auth/invalid-credential') {
        alert('Email o contraseña incorrectos.');
      } else if (error.code === 'auth/email-already-in-use') {
        alert('Este correo ya está registrado.');
      }
    }
  }
}