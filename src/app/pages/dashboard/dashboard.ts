import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router'; // RouterModule sirve para los links
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
    // Recuperamos el usuario del localStorage
    const userStr = localStorage.getItem('usuarioGamer');
    if (userStr) {
      this.usuario = JSON.parse(userStr);
    } else {
      // Si no hay usuario, lo saca
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}