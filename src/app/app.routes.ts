import { Routes } from '@angular/router';
import { Ubicacion } from './componentes/ubicacion/ubicacion';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Portada } from './componentes/portada/portada';

export const routes: Routes = [
  { path: '', component: Portada },
  { path: 'habitaciones', component: Catalogo },
  { path: 'contacto', component: Ubicacion },
  { path: '**', redirectTo: '' }
];