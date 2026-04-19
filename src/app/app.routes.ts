import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { VentasComponent } from './pages/ventas/ventas';
import { HistorialVentasComponent } from './pages/historial-ventas/historial-ventas';
import { ReservasComponent } from './pages/reservas/reservas';
import { InventarioComponent } from './pages/inventario/inventario';
import { CategoriasComponent } from './pages/categorias/categorias';
import { InicioComponent } from './pages/inicio/inicio'; 

// Definición de rutas principales de la aplicación
export const routes: Routes = [

  // ==========================================
  // Ruta raíz: muestra la Landing pública
  // ==========================================
  { path: '', component: LandingComponent },

  // ==========================================
  // Página de Login
  // ==========================================
  { path: 'login', component: LoginComponent },

  // ==========================================
  // Rutas del Dashboard (Intranet)
  // Este componente es el layout/contenedor
  // ==========================================
  { 
    path: 'dashboard', 
    component: DashboardComponent,

    // Rutas hijas que se renderizan dentro del <router-outlet> del Dashboard
    children: [
      // Redirección por defecto: al entrar a /dashboard nos manda a /dashboard/inicio
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      // /dashboard/inicio - Tu nuevo Centro de Operaciones
      { path: 'inicio', component: InicioComponent },

      // /dashboard/usuarios - Gestión de usuarios
      { path: 'usuarios', component: UsuariosComponent },

      // /dashboard/ventas - Registrar ventas
      { path: 'ventas', component: VentasComponent },

      // /dashboard/historial - Ver historial de ventas
      { path: 'historial', component: HistorialVentasComponent },

      // /dashboard/reservas - Ver o gestionar reservas
      { path: 'reservas', component: ReservasComponent },

      // /dashboard/inventario - Administración de inventario
      { path: 'inventario', component: InventarioComponent },

      // /dashboard/categorias - CRUD de categorías
      { path: 'categorias', component: CategoriasComponent },
    ]
  },

  // ==========================================
  // Ruta comodín: si escriben algo que no existe,
  // redirige nuevamente a la Landing
  // ==========================================
  { path: '**', redirectTo: '' }
];