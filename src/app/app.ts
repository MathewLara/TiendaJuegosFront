import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para poder usar *ngFor
import { RouterOutlet } from '@angular/router';
import { JuegoService } from './services/juego';
import { Videojuego } from './interfaces/videojuego';

//El AppComponent actúa como el componente raíz de Angular y su única responsabilidad es contener el <router-outlet>.
// Esto permite que Angular renderice dinámicamente las páginas según la ruta actual.
// Es por eso que no contiene lógica propia ni llamadas a servicios: toda la funcionalidad está dentro de las páginas del dashboard.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}