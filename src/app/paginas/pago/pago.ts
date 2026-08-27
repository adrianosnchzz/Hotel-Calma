import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PagoService } from '../../services/pago';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago.html',
  styleUrl: './pago.scss'
})
export class Pago implements OnInit {
  reserva = {
    suite: 'Reserva Alojamientos Calma',
    noches: 1,
    huespedes: 2,
    precioTotal: 0
  };

  cargando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['total']) this.reserva.precioTotal = Number(params['total']);
      if (params['suite']) this.reserva.suite = params['suite'];
      if (params['noches']) this.reserva.noches = Number(params['noches']);
      if (params['huespedes']) this.reserva.huespedes = Number(params['huespedes']);
    });
  }

  iniciarPagoRedsys(): void {
    console.log('0. Clic recibido en iniciarPagoRedsys. Total:', this.reserva.precioTotal);

    if (this.reserva.precioTotal <= 0) {
      alert('Importe de reserva no válido.');
      return;
    }

    this.cargando = true;
    const numeroOrden = Date.now().toString().slice(-10);

    // Se envía el importe normal (150). El servicio ya se encarga de convertirlo a céntimos (15000)
    const payload = {
      importe: this.reserva.precioTotal,
      concepto: `Reserva - ${this.reserva.suite}`,
      orden: numeroOrden
    };

    // Le pasamos el callback para desbloquear el botón si falla la petición
    this.pagoService.procesarPagoRedsys(payload, () => {
      this.cargando = false;
    });
  }
}