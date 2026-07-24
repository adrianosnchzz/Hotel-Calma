import { Component, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  constructor() {
    afterNextRender(() => {
      AOS.init({
        duration: 1000,
        once: true, // Evita que las animaciones desaparezcan al hacer scroll hacia arriba
        mirror: false
      });
      
      // Forzamos un refresh para que detecte los elementos iniciales correctamente
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    });
  }
}