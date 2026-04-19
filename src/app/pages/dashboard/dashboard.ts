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

  authService = inject(AuthService); 
  router = inject(Router);

  usuario: any = null;

  ngOnInit() {
    // 1. Verificamos si hay un token válido usando tu servicio
    if (this.authService.estaLogueado()) {
      // 2. Extraemos la información del usuario del token decodificado
      this.usuario = this.authService.getUsuarioActual();
      // Ojo: Si el token de Django no tiene nombre/rol, al menos tendrás el user_id
    } else {
      // Si no hay token, lo mandamos al login
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}