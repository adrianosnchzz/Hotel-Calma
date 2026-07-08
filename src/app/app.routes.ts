import { Routes } from '@angular/router';
import { Ubicacion } from './componentes/ubicacion/ubicacion';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Portada } from './componentes/portada/portada';
import { MiCuenta } from './componentes/mi-cuenta/mi-cuenta';

export const routes: Routes = [
  { path: '', component: Portada },
  { path: 'habitaciones', component: Catalogo },
  { path: 'contacto', component: Ubicacion },
  { path: 'mi-cuenta', component: MiCuenta },
  { path: '**', redirectTo: '' }
];