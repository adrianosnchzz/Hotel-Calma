import { Component, afterNextRender, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import * as AOS from 'aos';

import { Firestore, collection, getDocs, addDoc, Timestamp } from '@angular/fire/firestore';

import { Reserva } from '../../reserva/reserva'; 
import { Resenas } from '../resenas/resenas';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, Reserva, Resenas],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.scss']
})
export class Catalogo implements OnInit {
  habitaciones: any[] = [];
  
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  modalAbierto = false;
  fotoModal = '';
  fotosModal: string[] = [];
  indexModal = 0;

  constructor() {
    afterNextRender(async () => {
      // 1. Inicializamos Bootstrap Carousel y AOS de forma diferida tras el primer render
      const { Carousel } = await import('bootstrap');
      document.querySelectorAll('.carousel').forEach(el => new Carousel(el));
      AOS.init({ duration: 800, once: true }); 

      // 2. Cargamos las habitaciones aquí para que la web pinte la interfaz de forma instantánea
      this.cargarHabitaciones();
    });
  }

  ngOnInit() {
    // El ngOnInit se queda limpio para permitir una inicialización ultrarrápida del componente
  }

  private async cargarHabitaciones() {
    try {
      const habitacionesRef = collection(this.firestore, 'habitaciones');
      const querySnapshot = await getDocs(habitacionesRef);
      
      const tempHabitaciones: any[] = [];
      querySnapshot.forEach((doc) => {
        tempHabitaciones.push({ id: doc.id, ...doc.data() });
      });
      
      this.habitaciones = tempHabitaciones;
      this.cdr.markForCheck();

      if (typeof window !== 'undefined') {
        setTimeout(() => AOS.refresh(), 200);
      }
    } catch (error) {
      console.error("Error al cargar habitaciones desde Firebase:", error);
    }
  }

  async hacerReserva(habitacion: any) {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const reservasRef = collection(this.firestore, 'reservas');
      await addDoc(reservasRef, {
        habitacionId: habitacion.id,
        habitacionNombre: habitacion.Nombre || habitacion.nombre,
        precio: habitacion.precioBase,
        fechaReserva: Timestamp.now(),
        estado: 'PENDIENTE'
      });
      alert('¡Reserva realizada con éxito!');
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
    }
  }

  abrirModal(hab: any, i: number) {
    this.fotosModal = hab.fotos?.length > 0 ? hab.fotos : [hab.imagenUrl];
    const carousel = document.querySelector(`#carouselHab${i}`);
    const activeIndex = carousel ? Array.from(carousel.querySelectorAll('.carousel-item')).findIndex(el => el.classList.contains('active')) : 0;
    this.indexModal = activeIndex >= 0 ? activeIndex : 0;
    this.fotoModal = this.fotosModal[this.indexModal];
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  modalSiguiente() {
    this.indexModal = (this.indexModal + 1) % this.fotosModal.length;
    this.fotoModal = this.fotosModal[this.indexModal];
  }

  modalAnterior() {
    this.indexModal = (this.indexModal - 1 + this.fotosModal.length) % this.fotosModal.length;
    this.fotoModal = this.fotosModal[this.indexModal];
  }
  
  irAUbicacion() {
    const el = document.querySelector('app-ubicacion');
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}