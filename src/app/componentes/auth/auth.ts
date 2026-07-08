import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss']
})
export class AuthComponent implements OnInit {
  modalAbierto    = false;
  esLogin         = true;
  dropdownAbierto = false;
  procesando      = false;   
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
          const docRef  = doc(this.firestore, 'usuarios', user.uid);
          const docSnap = await getDoc(docRef);
          this.usuarioLogueado = docSnap.exists()
            ? { uid: user.uid, email: user.email, ...docSnap.data() }
            : { uid: user.uid, email: user.email, nombre: 'Usuario' };
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

  @HostListener('document:click')
  onDocumentClick() {
    if (this.dropdownAbierto) {
      this.dropdownAbierto = false;
      this.cdr.detectChanges();
    }
  }

  toggleDropdown()  { this.dropdownAbierto = !this.dropdownAbierto; }
  cerrarDropdown()  { this.dropdownAbierto = false; }
  abrirModal()      { this.modalAbierto = true; }
  cerrarModal()     { this.modalAbierto = false; }

  async logout() {
    await signOut(this.auth);
    this.usuarioLogueado = null;
    this.dropdownAbierto = false;
    this.router.navigate(['/']);
    this.cdr.detectChanges();
  }

  async confirmar() {
    if (this.procesando) return;   
    this.procesando = true;
    this.cdr.detectChanges();

    try {
      if (this.esLogin) {
        await signInWithEmailAndPassword(this.auth, this.usuario.email, this.usuario.password);
      } else {
        const credencial = await createUserWithEmailAndPassword(
          this.auth, this.usuario.email, this.usuario.password
        );
        await setDoc(doc(this.firestore, 'usuarios', credencial.user.uid), {
          nombre: this.usuario.nombre,
          dni:    this.usuario.dni,
          email:  this.usuario.email,
          rol:    'cliente'
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
    } finally {
      this.procesando = false;
      this.cdr.detectChanges();
    }
  }
}