import { Component, afterNextRender } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import * as AOS from 'aos';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [GoogleMap, MapMarker],
  templateUrl: './ubicacion.html',
  styleUrls: ['./ubicacion.scss']
})
export class Ubicacion {
  center = { lat: 36.835, lng: -5.399 };
  zoom = 15;

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    // 💡 SOLUCIÓN MÓVIL: Permite hacer scroll en la web con un dedo 
    // y evita que el mapa "atrape" la pantalla del usuario.
    gestureHandling: 'cooperative', 
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#f5f0e8' }] },
      { featureType: 'water', stylers: [{ color: '#a8d5ba' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c8e6c9' }] },
      { featureType: 'landscape', stylers: [{ color: '#e8f5e9' }] },
    ]
  };

  markerOptions: google.maps.MarkerOptions = {
    title: 'Hotel Calma'
  };

  constructor() {
    afterNextRender(() => {
      AOS.init({ duration: 1000, once: false });
    });
  }
}