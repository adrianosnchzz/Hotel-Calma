import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';
import {
  Firestore,
  doc, getDoc,
  collection, query, where, getDocs,
  deleteDoc
} from '@angular/fire/firestore';

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
  reservas: any[] = [];
  resenas: any[] = [];
  cargando = true;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    authState(this.auth).subscribe(async (user: User | null) => {
      if (user) {
        const snap = await getDoc(doc(this.firestore, 'usuarios', user.uid));
        this.usuario = snap.exists()
          ? { uid: user.uid, email: user.email, ...snap.data() }
          : { uid: user.uid, email: user.email, nombre: 'Usuario' };
        await this.cargarReservas(user.uid);
        await this.cargarResenas(user.uid);
      }
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  async cargarReservas(uid: string) {
    try {
      const q = query(
        collection(this.firestore, 'reservas'),
        where('idUsuario', '==', uid)
      );
      const snap = await getDocs(q);
      this.reservas = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
    } catch (e) { console.error(e); }
  }

  async cargarResenas(uid: string) {
    try {
      const q = query(
        collection(this.firestore, 'resenas'),
        where('idUsuario', '==', uid)
      );
      const snap = await getDocs(q);
      this.resenas = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
    } catch (e) { console.error(e); }
  }

  // ─ comprueba si la fechaSalida ya pasó ─
  esReservaPasada(reserva: any): boolean {
    if (!reserva.fechaSalida) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const salida = new Date(reserva.fechaSalida);
    salida.setHours(0, 0, 0, 0);
    return salida < hoy;
  }

  // - getters que separan activas de pasadas ─
  get reservasActivas(): any[] {
    return this.reservas.filter(r => !this.esReservaPasada(r));
  }

  get reservasPasadas(): any[] {
    return this.reservas.filter(r => this.esReservaPasada(r));
  }

  // ─ Solo se puede cancelar si la reserva no ha caducado ─
  async cancelarReserva(reserva: any) {
    if (this.esReservaPasada(reserva)) return; // doble seguridad

    const confirmar = confirm(
      `¿Seguro que quieres cancelar la reserva de "${reserva.habitacionNombre}"?`
    );
    if (!confirmar) return;

    try {
      await deleteDoc(doc(this.firestore, 'reservas', reserva.id));
      this.reservas = this.reservas.filter(r => r.id !== reserva.id);
      this.cdr.detectChanges();
    } catch (e) {
      console.error(e);
      alert('No se pudo cancelar la reserva.');
    }
  }

  setPestana(p: 'info' | 'reservas') { this.pestana = p; }

  formatFecha(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  inicial(): string {
    return (this.usuario?.nombre || 'U').charAt(0).toUpperCase();
  }

  resenaDeHabitacion(nombreHab: string): any {
    return this.resenas.find(r => r.habitacionNombre === nombreHab) || null;
  }
}