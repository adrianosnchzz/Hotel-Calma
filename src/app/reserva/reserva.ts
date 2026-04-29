import { Component, Input, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDate, NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { Auth, authState, User } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, where, getDocs, doc, deleteDoc } from '@angular/fire/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDatepickerModule],
  templateUrl: './reserva.html',
  styleUrls: ['./reserva.scss']
})
export class Reserva implements OnInit {
  @Input() habitacion: any;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private calendar = inject(NgbCalendar);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  modalAbierto = false;
  modalInfoAbierto = false;
  modalCancelarAbierto = false;
  paso = 1;

  reservaConfirmada = false;
  usuarioActual: User | null = null;
  reservaId: string | null = null;
  detallesReserva: any = null;

  fechasOcupadasStr: string[] = [];

  quiereLimpieza = false;
  quiereDesayuno = false;
  precioLimpieza = 30;
  precioDesayuno = 15;

  procesandoPago = false;
  stripeInstance: any;
  stripeElements: any;

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 1);

  ngOnInit() {
    this.cargarFechasOcupadas();

    authState(this.auth).subscribe(user => {
      this.usuarioActual = user;
      if (user) {
        this.verificarReservaExistente();
      } else {
        this.resetearEstadoReserva();
      }
    });
  }

  async cargarFechasOcupadas() {
    const nombreHab = this.habitacion?.nombre || this.habitacion?.Nombre;
    if (!nombreHab) return;

    try {
      const q = query(
        collection(this.firestore, 'reservas'),
        where('habitacionNombre', '==', nombreHab),
        where('estado', '==', 'confirmada')
      );

      const querySnapshot = await getDocs(q);
      const fechasBloqueadas: string[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const entrada = new Date(data['fechaEntrada']);
        const salida = new Date(data['fechaSalida']);

        let actual = new Date(entrada);
        while (actual <= salida) {
          fechasBloqueadas.push(`${actual.getFullYear()}-${actual.getMonth() + 1}-${actual.getDate()}`);
          actual.setDate(actual.getDate() + 1);
        }
      });

      this.fechasOcupadasStr = fechasBloqueadas;
      this.cdr.detectChanges();

    } catch (error) {
      console.error(error);
    }
  }

  rangoTieneDiasOcupados(desde: NgbDate, hasta: NgbDate): boolean {
    const f1 = new Date(desde.year, desde.month - 1, desde.day);
    const f2 = new Date(hasta.year, hasta.month - 1, hasta.day);

    let actual = new Date(f1);
    while (actual <= f2) {
      const str = `${actual.getFullYear()}-${actual.getMonth() + 1}-${actual.getDate()}`;
      if (this.fechasOcupadasStr.includes(str)) return true;
      actual.setDate(actual.getDate() + 1);
    }
    return false;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      if (this.rangoTieneDiasOcupados(this.fromDate, date)) {
        this.fromDate = date;
        this.toDate = null;
      } else {
        this.toDate = date;
      }
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  deshabilitarDias = (date: NgbDateStruct) => {
    const hoy = this.calendar.getToday();
    const esPasado = (date.year < hoy.year || (date.year === hoy.year && date.month < hoy.month) || (date.year === hoy.year && date.month === hoy.month && date.day < hoy.day));
    if (esPasado) return true;

    const dateStr = `${date.year}-${date.month}-${date.day}`;
    return this.fechasOcupadasStr.includes(dateStr);
  };

  isHovered(date: NgbDate) { return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate); }
  isInside(date: NgbDate) { return this.toDate && date.after(this.fromDate) && date.before(this.toDate); }
  isRange(date: NgbDate) { return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date); }

  async verificarReservaExistente() {
    if (!this.usuarioActual || !this.habitacion) return;

    const nombreHab = this.habitacion.nombre || this.habitacion.Nombre || 'Desconocida';

    try {
      const q = query(collection(this.firestore, 'reservas'), where('idUsuario', '==', this.usuarioActual.uid));
      const querySnapshot = await getDocs(q);

      const docReserva = querySnapshot.docs.find(d => {
        const datos = d.data();
        return datos['habitacionNombre'] === nombreHab && datos['estado'] === 'confirmada';
      });

      if (docReserva) {
        this.reservaConfirmada = true;
        this.reservaId = docReserva.id;
        this.detallesReserva = docReserva.data();
      } else {
        this.resetearEstadoReserva();
      }
      this.cdr.detectChanges();

    } catch (error) {
      console.error(error);
    }
  }

  async confirmarCancelacion() {
    if (!this.reservaId) return;

    try {
      const referenciaDocumento = doc(this.firestore, 'reservas', this.reservaId);
      await deleteDoc(referenciaDocumento);

      this.resetearEstadoReserva();
      this.modalCancelarAbierto = false;
      this.cargarFechasOcupadas();
      this.cdr.detectChanges();

    } catch (error) {
      console.error(error);
    }
  }

  resetearEstadoReserva() {
    this.reservaConfirmada = false;
    this.reservaId = null;
    this.detallesReserva = null;
    this.cdr.detectChanges();
  }

  get precioNoche(): number { return this.habitacion?.precioBase || this.habitacion?.precio || 80; }
  get diasTotales(): number {
    if (!this.fromDate || !this.toDate) return 0;
    const f1 = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    const f2 = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
    return Math.round((f2.getTime() - f1.getTime()) / (1000 * 3600 * 24));
  }
  get totalPagar(): number {
    let total = this.diasTotales * this.precioNoche;
    if (this.quiereLimpieza) total += this.precioLimpieza;
    if (this.quiereDesayuno) total += (this.precioDesayuno * this.diasTotales);
    return total;
  }

  abrirModal() {
    if (!this.usuarioActual) {
      alert("Inicie sesión para reservar una suite.");
      return;
    }
    this.modalAbierto = true;
    this.paso = 1;
  }

  cerrarModal() { this.modalAbierto = false; }
  siguiente() { if (this.paso < 3) this.paso++; }
  atras() { if (this.paso > 1) this.paso--; }

  async finalizarPago() {
    if (!this.usuarioActual) {
      alert("Inicie sesión para reservar una suite.");
      return;
    }

    this.procesandoPago = true;
    const cantidadEnCentimos = Math.round(this.totalPagar * 100);

    this.http.post<any>(
      'https://crearintentopago-346k4pz6ba-uc.a.run.app/',
      { amount: cantidadEnCentimos },
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: async (respuesta) => {
        this.stripeInstance = await loadStripe('pk_test_51TKEzvLMUXgJ5ntRVEheH71rIKduqh3hWbUzq0bcLVlTKDq4mKBo3BHjipSjTYOHpTEPYE3JwQ7k6g60jTgviXMF003joRkQVw');
        this.stripeElements = this.stripeInstance.elements({ clientSecret: respuesta.clientSecret });
        const paymentElement = this.stripeElements.create('payment');
        paymentElement.mount('#payment-element');
        this.procesandoPago = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error técnico:", error);
        this.procesandoPago = false;
        alert("Error al conectar con el servidor de pagos.");
      }
    });
  }

  async confirmarPagoStripe() {
    this.procesandoPago = true;

    const resultado = await this.stripeInstance.confirmPayment({
      elements: this.stripeElements,
      redirect: 'if_required'
    });

    if (resultado.error) {
      alert("Error en el pago: " + resultado.error.message);
      this.procesandoPago = false;
    } else {
      await this.guardarReservaEnFirebase();
    }
  }

  async guardarReservaEnFirebase() {
    try {
      const nombreHab = this.habitacion?.nombre || this.habitacion?.Nombre || 'Desconocida';

      const nuevaReserva = {
        idUsuario: this.usuarioActual!.uid,
        emailUsuario: this.usuarioActual!.email,
        habitacionNombre: nombreHab,
        fechaEntrada: new Date(this.fromDate!.year, this.fromDate!.month - 1, this.fromDate!.day).toISOString(),
        fechaSalida: new Date(this.toDate!.year, this.toDate!.month - 1, this.toDate!.day).toISOString(),
        diasTotales: this.diasTotales,
        totalPagado: this.totalPagar,
        extras: { limpieza: this.quiereLimpieza, desayuno: this.quiereDesayuno },
        estado: 'confirmada',
        fechaCreacion: new Date().toISOString()
      };

      const docRef = await addDoc(collection(this.firestore, 'reservas'), nuevaReserva);

      this.reservaId = docRef.id;
      this.detallesReserva = nuevaReserva;
      this.reservaConfirmada = true;
      this.procesandoPago = false;
      this.cerrarModal();
      this.cargarFechasOcupadas();
      this.cdr.detectChanges();

    } catch (error) {
      console.error(error);
      this.procesandoPago = false;
    }
  }
}