import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [CommonModule, RouterOutlet, RouterModule], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  // Inyectamos servicios usando la función inject().
  // Es la forma moderna de Angular para obtener instancias de servicios sin usar constructor.
  authService = inject(AuthService); 
  router = inject(Router);

  // Aquí guardaremos los datos del usuario que está logueado
  usuario: any = null;

  ngOnInit() {

    /**
     * Cuando este componente se carga, lo primero que hace es revisar si el usuario ha iniciado sesión.
     * ¿Cómo lo revisa? Mirando el localStorage.
     * Durante el login, se guardó al usuario como un JSON en la clave: "usuarioGamer".
     * Aquí lo recuperamos para que el dashboard sepa quién es, qué mostrar y no deje entrar sin permisos.
     */
    const userStr = localStorage.getItem('usuarioGamer');

    if (userStr) {
      /**
       * Si sí existe algo en localStorage:
       * - Lo convertimos de string -> a objeto usando JSON.parse
       * - Lo guardamos en la variable usuario para usarlo en el HTML.
       */
      this.usuario = JSON.parse(userStr);

    } else {
      /**
       * Si NO encontramos nada:
       * - Significa que la persona intentó entrar al dashboard sin loguearse.
       *   (O borró su localStorage, o la sesión expiró)
       * Por seguridad, lo redirigimos al /login.
       */
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion() {
    /**
     * Este método se ejecuta cuando el usuario da clic en "Cerrar sesión".
     * 
     * 1. Llamamos a AuthService.logout(), que borra la información del usuario del localStorage.
     * 2. Redirigimos al usuario nuevamente al login.
     * 
     */
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
