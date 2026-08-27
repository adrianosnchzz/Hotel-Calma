import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthComponent } from './componentes/auth/auth';
import { Footer } from './components/footer/footer'; // AÑADIDO: Importación siguiendo tu estructura de nombres

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AuthComponent, Footer], // AÑADIDO: Footer registrado aquí
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const AOS = (window as any)['AOS'];
      if (AOS) {
        AOS.init({ duration: 1000, once: false });
      }
    }
  }
}