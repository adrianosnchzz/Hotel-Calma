import { Component, PLATFORM_ID, inject, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-portada',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portada.html',
  styleUrls: ['./portada.scss']
})
export class Portada {
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // afterNextRender asegura que el código se ejecute SOLO en el navegador
    afterNextRender(() => {
     
      AOS.init({
        duration: 1000,
        once: true, // Esto ayuda a que no desaparezcan al hacer scroll arriba
        mirror: false
      });
      
      // Forzamos un refresh para que detecte los elementos recién creados
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    });
  }
}