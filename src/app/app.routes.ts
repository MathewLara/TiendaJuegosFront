import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent} from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { VentasComponent } from './pages/ventas/ventas';
import { HistorialVentasComponent } from './pages/historial-ventas/historial-ventas';
import { ReservasComponent } from './pages/reservas/reservas';
import { InventarioComponent } from './pages/inventario/inventario';
import { CategoriasComponent } from './pages/categorias/categorias';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      // Cuando entras a /dashboard, por defecto no muestra nada, o una bienvenida
      { path: 'usuarios', component: UsuariosComponent }, 
      { path: 'ventas', component: VentasComponent },
      { path: 'historial', component: HistorialVentasComponent },
      { path: 'reservas', component: ReservasComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'categorias', component: CategoriasComponent },
    ]
  },
    { path: '**', redirectTo: '' }
];
