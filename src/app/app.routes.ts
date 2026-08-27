import { Routes } from '@angular/router';
import { Ubicacion } from './componentes/ubicacion/ubicacion';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Portada } from './componentes/portada/portada';
import { MiCuenta } from './componentes/mi-cuenta/mi-cuenta';
import { Galeria } from './componentes/galeria/galeria';
import { Legal } from './pages/legal/legal';
import { Pago } from './paginas/pago/pago';
import { GenerarLink } from './paginas/generar-link/generar-link';

export const routes: Routes = [
  { path: '', component: Portada },
  { path: 'habitaciones', component: Catalogo },
  { path: 'galeria', component: Galeria }, 
  { path: 'contacto', component: Ubicacion },
  { path: 'mi-cuenta', component: MiCuenta },

  // Nuevas rutas de pago
  { path: 'crear-pago', component: GenerarLink },
  { path: 'pago', component: Pago },

  // Rutas legales
  { path: 'aviso-legal', component: Legal, data: { type: 'aviso-legal' } },
  { path: 'terminos-y-condiciones', component: Legal, data: { type: 'terminos' } },
  { path: 'politica-privacidad', component: Legal, data: { type: 'privacidad' } },
  { path: 'politica-cookies', component: Legal, data: { type: 'cookies' } },

  
  { path: '**', redirectTo: '' }
];