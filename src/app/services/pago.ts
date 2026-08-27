import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export interface PagoPayload {
  importe: number;
  concepto: string;
  orden: string;
}

export interface RespuestaRedsys {
  url: string;
  params: {
    Ds_SignatureVersion: string;
    Ds_MerchantParameters: string;
    Ds_Signature: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private backendUrl = 'https://crearpagoredsys-346k4pz6ba-uc.a.run.app';

  procesarPagoRedsys(payload: PagoPayload, onError?: () => void): void {
    console.log('1. [Service] Enviando petición HTTP a Cloud Function con:', payload);

    this.http.post<RespuestaRedsys>(this.backendUrl, payload).subscribe({
      next: (respuesta) => {
        console.log('2. [Service] Respuesta recibida del servidor:', respuesta);
        this.enviarAFormularioRedsys(respuesta);
      },
      error: (err) => {
        console.error('❌ [Service] Error HTTP:', err);
        alert('Hubo un fallo al conectar con la pasarela de pago.');
        if (onError) onError();
      }
    });
  }

  private enviarAFormularioRedsys(respuesta: RespuestaRedsys): void {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('3. [Service] Creando formulario oculto para redirigir a Redsys...');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = respuesta.url;

    Object.entries(respuesta.params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }
}