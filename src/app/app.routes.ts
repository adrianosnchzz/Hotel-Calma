import { Routes } from '@angular/router';
import { Ubicacion } from './componentes/ubicacion/ubicacion';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Portada } from './componentes/portada/portada';
import { MiCuenta } from './componentes/mi-cuenta/mi-cuenta';
import { Galeria } from './componentes/galeria/galeria';




export const routes: Routes = [
  { path: '', component: Portada },
  { path: 'habitaciones', component: Catalogo },
  // 2. AÑADIMOS LA RUTA PARA QUE SEA ACCESIBLE DESDE LA NAVBAR
  { path: 'galeria', component: Galeria }, 
  { path: 'contacto', component: Ubicacion },
  { path: 'mi-cuenta', component: MiCuenta },
  { path: '**', redirectTo: '' }
];