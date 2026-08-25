import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

interface FotoGaleria {
  url: string;
  titulo: string;
  categoria: 'entrada' | 'salon-cocina' | 'patio' | 'azotea' | 'paisajes';
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './galeria.html',
  styleUrls: ['./galeria.scss']
})
export class Galeria implements OnInit {
  categoriaActiva: string = 'todas';
  lightboxAbierto = false;
  indexActivo = 0;

  fotos: FotoGaleria[] = [
  // 1. Entrada (1 foto)
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_194734_1000x1000.webp?alt=media&token=f3004c25-f7ef-4122-8b2f-385c0a043514', titulo: 'Acceso principal', categoria: 'entrada' },
  
  // 2. Salón-Cocina (2 fotos)
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260704102015_1000x1000.webp?alt=media&token=ffd17bbf-4642-4600-abd8-3668d1135db6', titulo: 'Espacio diáfano salón-cocina', categoria: 'salon-cocina' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_195240_1000x1000.webp?alt=media&token=e86680dd-ed7f-4305-b39a-57eb6e73bdf0', titulo: 'Detalles y equipamiento de la cocina', categoria: 'salon-cocina' },
  
  // 3. Patio (2 fotos)
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Fotos-paisaje-edificio%2FIMG_20260704_200020_1000x1000.webp?alt=media&token=1b9acd33-26be-4015-8e72-61faa9ed3cbc', titulo: 'Patio interior privado', categoria: 'patio' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Fotos-paisaje-edificio%2FIMG_20260704_200104_1000x1000.webp?alt=media&token=b68405a6-d204-4ca5-978c-f6b0c14917f7', titulo: 'Rincón de descanso en el patio', categoria: 'patio' },
  
  // 4. Azotea (3 fotos)
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Fotos-paisaje-edificio%2FIMG_20260704_200411_1000x1000.webp?alt=media&token=fa5ebcfd-4e7b-4603-922f-835633941298', titulo: 'Terraza de la azotea', categoria: 'azotea' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Fotos-paisaje-edificio%2FIMG_20260704_200451_1000x1000.webp?alt=media&token=567dc07b-cf78-4f80-ba0b-52a1be5fed3e', titulo: 'Vistas al castillo de día', categoria: 'azotea' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Fotos-paisaje-edificio%2FLa%20azotea%20de%20noche%20con%20celos%C3%ADa%20(1)_1000x1000.webp?alt=media&token=ba3b652a-48fe-4332-b1ca-8824274173d8', titulo: 'Vistas al castillo de noche', categoria: 'azotea' },
  
  // 5. Paisajes (4 fotos)
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260522212225_1000x1000.webp?alt=media&token=5c9212dd-6801-4304-a77a-ee71a3d4c55a', titulo: 'Vistas a la sierra de Cádiz', categoria: 'paisajes' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260523095316_1000x1000.webp?alt=media&token=8ab29ffa-be44-48ca-bf3b-f63960bc0d43', titulo: 'Entorno natural del alojamiento', categoria: 'paisajes' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260704212642_1000x1000.webp?alt=media&token=fbab64db-7022-489c-b3d7-744aff2c6f52', titulo: 'Atardecer desde los valles circundantes', categoria: 'paisajes' },
  { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Fotos-paisaje-edificio%2FLa%20azotea%20de%20noche%20con%20celos%C3%ADa%20(1)_1000x1000.webp?alt=media&token=ba3b652a-48fe-4332-b1ca-8824274173d8', titulo: 'Vista nocturna del castillo', categoria: 'paisajes' }
];

  ngOnInit(): void {}

  get fotosFiltradas(): FotoGaleria[] {
    if (this.categoriaActiva === 'todas') return this.fotos;
    return this.fotos.filter(f => f.categoria === this.categoriaActiva);
  }

  seleccionarCategoria(cat: string) {
    this.categoriaActiva = cat;
  }

  abrirLightbox(index: number) {
    this.indexActivo = index;
    this.lightboxAbierto = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarLightbox() {
    this.lightboxAbierto = false;
    document.body.style.overflow = '';
  }

  anteriorFoto() {
    this.indexActivo = this.indexActivo === 0 ? this.fotosFiltradas.length - 1 : this.indexActivo - 1;
  }

  siguienteFoto() {
    this.indexActivo = this.indexActivo === this.fotosFiltradas.length - 1 ? 0 : this.indexActivo + 1;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.lightboxAbierto) return;

    if (event.key === 'Escape') {
      this.cerrarLightbox();
    } else if (event.key === 'ArrowLeft') {
      this.anteriorFoto();
    } else if (event.key === 'ArrowRight') {
      this.siguienteFoto();
    }
  }
}