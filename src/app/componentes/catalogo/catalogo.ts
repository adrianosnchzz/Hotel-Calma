import { Component, afterNextRender, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as AOS from 'aos';

import { Firestore, collection, getDocs, addDoc, Timestamp } from '@angular/fire/firestore';

import { Reserva } from '../../reserva/reserva'; 

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, Reserva], 
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.scss']
})
export class Catalogo implements OnInit {
  habitaciones: any[] = [];
  
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef); // 1. Herramienta para actualizar la pantalla

  modalAbierto = false;
  fotoModal = '';
  fotosModal: string[] = [];
  indexModal = 0;

  constructor() {
    afterNextRender(async () => {
      const { Carousel } = await import('bootstrap');
      document.querySelectorAll('.carousel').forEach(el => new Carousel(el));
      AOS.init({ duration: 1000, once: false });
    });
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const habitacionesRef = collection(this.firestore, 'habitaciones');
        const querySnapshot = await getDocs(habitacionesRef);
        
        const tempHabitaciones: any[] = [];
        querySnapshot.forEach((doc) => {
          tempHabitaciones.push({ id: doc.id, ...doc.data() });
        });
        
        this.habitaciones = tempHabitaciones;
        console.log('¡Exito! Habitaciones cargadas:', this.habitaciones);

        // 2. ¡DESPERTAMOS A ANGULAR PARA QUE PINTE EL HTML!
        this.cdr.detectChanges();

        if (typeof window !== 'undefined') {
          setTimeout(() => AOS.refresh(), 500);
        }
      } catch (error) {
        console.error("Error al cargar habitaciones desde Firebase:", error);
      }
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
      alert('¡Reserva realizada con éxito! Se ha guardado en tu base de datos.');
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      alert('Error al conectar con Firebase.');
    }
  }

  // --- Lógica de Modales ---

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