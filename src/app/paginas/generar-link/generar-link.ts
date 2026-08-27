import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generar-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generar-link.html',
  styleUrl: './generar-link.scss'
})
export class GenerarLink {
  private platformId = inject(PLATFORM_ID);

  suite: string = 'Suite Calma Deluxe';
  noches: number = 2;
  huespedes: number = 2;
  total: number = 150;
  copiado: boolean = false;

  obtenerLink(): string {
    const params = new URLSearchParams({
      suite: this.suite,
      noches: this.noches.toString(),
      huespedes: this.huespedes.toString(),
      total: this.total.toString()
    });

    // Control de SSR: Si no estamos en el navegador, usamos el dominio base
    const origin = isPlatformBrowser(this.platformId)
      ? window.location.origin
      : 'https://alojamientoscalma.es';

    return `${origin}/pago?${params.toString()}`;
  }

  copiarMensajeWhatsApp(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const mensaje = `¡Hola! Te paso el enlace oficial para confirmar y pagar tu reserva en Alojamientos Calma:

*${this.suite}* (${this.noches} noches - ${this.huespedes} huéspedes)
*Total:* ${this.total} € (IVA inc.)

💳 *Enlace de pago seguro (Tarjeta / Bizum):*
${this.obtenerLink()}

Al completar el pago la reserva queda confirmada. ¡Cualquier duda me dices!`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(mensaje).then(() => {
        this.copiado = true;
        setTimeout(() => (this.copiado = false), 3000);
      });
    }
  }
}