import { Component, Input, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, authState, User } from '@angular/fire/auth';
import {
  Firestore,
  collection, query, where, getDocs,
  addDoc, updateDoc, doc
} from '@angular/fire/firestore';

@Component({
  selector: 'app-resena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resenas.html',
  styleUrls: ['./resenas.scss']
})
export class Resenas implements OnInit {
  @Input() habitacion: any;

  private auth      = inject(Auth);
  private firestore = inject(Firestore);
  private cdr       = inject(ChangeDetectorRef);

  usuarioActual: User | null = null;
  nombreUsuario = '';

  resenas: any[] = [];
  miResena: any = null;
  puedeResenar = false; // Controlará si el usuario está registrado

  modalAbierto  = false;
  popupAbierto  = false;
  estrellaHover = 0;
  form = { valoracion: 0, comentario: '' };
  enviando = false;

  ngOnInit() {
    authState(this.auth).subscribe(async (user: User | null) => {
      this.usuarioActual = user;
      if (user) {
        this.puedeResenar = true; // ¡Con solo estar registrado ya puede valorar!
        await this.cargarNombreUsuario(user.uid);
        await this.cargarMiResena(user.uid);
      } else {
        this.puedeResenar = false;
        this.miResena = null;
      }
      await this.cargarResenas();
      this.cdr.detectChanges();
    });
  }

  get nombreHab(): string {
    return this.habitacion?.nombre || this.habitacion?.Nombre || '';
  }

  async cargarNombreUsuario(uid: string) {
    try {
      const snap = await getDocs(collection(this.firestore, 'usuarios'));
      const docU = snap.docs.find(d => d.id === uid);
      this.nombreUsuario = docU?.data()['nombre'] || 'Usuario';
    } catch (e) { this.nombreUsuario = 'Usuario'; }
  }

  async cargarResenas() {
    try {
      const q = query(
        collection(this.firestore, 'resenas'),
        where('habitacionNombre', '==', this.nombreHab)
      );
      const snap = await getDocs(q);
      this.resenas = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
    } catch (e) { console.error(e); }
  }

  async cargarMiResena(uid: string) {
    try {
      const q = query(
        collection(this.firestore, 'resenas'),
        where('idUsuario', '==', uid),
        where('habitacionNombre', '==', this.nombreHab)
      );
      const snap = await getDocs(q);
      this.miResena = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (e) { this.miResena = null; }
  }

  get mediaValoracion(): number {
    if (!this.resenas.length) return 0;
    return this.resenas.reduce((s, r) => s + r.valoracion, 0) / this.resenas.length;
  }

  abrirModal() {
    if (this.miResena) {
      this.form = { valoracion: this.miResena.valoracion, comentario: this.miResena.comentario };
    } else {
      this.form = { valoracion: 0, comentario: '' };
    }
    this.estrellaHover = 0;
    this.modalAbierto = true;
  }

  cerrarModal()        { this.modalAbierto = false; }
  abrirPopupResenas()  { this.popupAbierto = true; }
  cerrarPopupResenas() { this.popupAbierto = false; }

  setEstrella(n: number)   { this.form.valoracion = n; }
  hoverEstrella(n: number) { this.estrellaHover = n; }
  salirEstrella()          { this.estrellaHover = 0; }

  async enviarResena() {
    if (!this.form.valoracion || !this.form.comentario.trim() || !this.usuarioActual) return;
    this.enviando = true;

    try {
      const datos = {
        idUsuario:        this.usuarioActual.uid,
        nombreUsuario:    this.nombreUsuario,
        habitacionNombre: this.nombreHab,
        valoracion:       this.form.valoracion,
        comentario:       this.form.comentario.trim(),
        fechaCreacion:    new Date().toISOString()
      };

      if (this.miResena) {
        await updateDoc(doc(this.firestore, 'resenas', this.miResena.id), datos);
        this.miResena = { ...this.miResena, ...datos };
      } else {
        const ref = await addDoc(collection(this.firestore, 'resenas'), datos);
        this.miResena = { id: ref.id, ...datos };
      }

      await this.cargarResenas();
      this.cerrarModal();
    } catch (e) {
      console.error(e);
      alert('Error al guardar la reseña.');
    }

    this.enviando = false;
    this.cdr.detectChanges();
  }

  estrellaActiva(n: number): boolean {
    return n <= (this.estrellaHover || this.form.valoracion);
  }

  trackById(_: number, r: any) { return r.id; }
}