import { Component, OnInit } from '@angular/core';
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
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_194734.jpg?alt=media&token=c88daeac-1454-4c84-9b96-fc3f06e9cb58', titulo: 'Acceso principal', categoria: 'entrada' },
    
    // 2. Salón-Cocina (2 fotos)
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260704102015.jpg?alt=media&token=845f91fe-0fa2-4aea-87f2-ff692b26d5a0', titulo: 'Espacio diáfano salón-cocina', categoria: 'salon-cocina' },
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_195240.jpg?alt=media&token=2a176389-a925-46aa-a943-f6ad9b9e415a', titulo: 'Detalles y equipamiento de la cocina', categoria: 'salon-cocina' },
    
    // 3. Patio (2 fotos)
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_200104.jpg?alt=media&token=65302364-3a28-47a3-b280-42ee2d4be274', titulo: 'Patio interior privado', categoria: 'patio' },
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_200202%20(1).jpg?alt=media&token=7c9ea109-7151-4061-8efc-8d37f8bee215', titulo: 'Rincón de descanso en el patio', categoria: 'patio' },
    
    // 4. Azotea (3 fotos)
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_200411%20(1).jpg?alt=media&token=839f6d42-df3c-4bc8-9e52-629a3cb9da50', titulo: 'Terraza de la azotea', categoria: 'azotea' },
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG_20260704_200451%20(1).jpg?alt=media&token=b6f16413-0986-44c5-8474-902083919d11', titulo: 'Vistas al castillo de día', categoria: 'azotea' },
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FLa%20azotea%20de%20noche%20con%20celos%C3%ADa%20(1).jpg?alt=media&token=2583aa13-f4f1-43b8-a641-8d0a44476dcc', titulo: 'Vistas al castillo de noche', categoria: 'azotea' },
    
    // 5. Paisajes (4 fotos)
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260523095316.jpg?alt=media&token=e644159f-7abd-4732-be91-19d3cf12e086', titulo: 'Vistas a la sierra de Cádiz', categoria: 'paisajes' },
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260704212642.jpg?alt=media&token=2247ee77-f50d-49bb-bbf6-4511f0d312f7', titulo: 'Entorno natural del alojamiento', categoria: 'paisajes' },
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260522212225.jpg?alt=media&token=e6a3390a-28b0-46f3-87fd-138ebcf9b424', titulo: 'Atardecer desde los valles circundantes', categoria: 'paisajes' },
    { url: 'https://firebasestorage.googleapis.com/v0/b/hotel-calma-cdb42.firebasestorage.app/o/Galeria%2FIMG20260705014416.jpg?alt=media&token=9929f2ee-4176-4ff6-a703-f1e009238458', titulo: 'Vista nocturna del castillo', categoria: 'paisajes' }
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
}