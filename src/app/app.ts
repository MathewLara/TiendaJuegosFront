import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para poder usar *ngFor
import { RouterOutlet } from '@angular/router';
import { JuegoService } from './services/juego';
import { Videojuego } from './interfaces/videojuego';
@Component({
  selector: 'app-root',
  standalone: true,
 imports: [ RouterOutlet, CommonModule], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  // 1. Inyectamos tu servicio 
  private juegoService = inject(JuegoService);
  
  // 2. Preparamos una lista vacía para recibir los videojuegos
  listaJuegos: Videojuego[] = [];

  // 3. Esta función se ejecuta sola al iniciar la página
  ngOnInit(): void {
    this.juegoService.getVideojuegos().subscribe({
      next: (datos) => {
        // Aquí guardamos los datos que llegaron del Backend
        this.listaJuegos = datos;
        console.log('¡Éxito! Videojuegos cargados:', datos);
      },
      error: (e) => {
        console.error('Error conectando:', e);
      }
    });
  }
}