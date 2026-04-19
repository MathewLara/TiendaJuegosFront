import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Videojuego } from '../interfaces/videojuego';

// Hacemos que este servicio esté disponible en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class JuegoService {

  // Inyectamos HttpClient usando la función inject 
  private http = inject(HttpClient);

  // NUEVA URL BASE: Apunta a Django
  private apiUrl = 'http://127.0.0.1:8000/api/videojuegos/'; 

  constructor() { }

  // ==========================================
  // 1. Listar todos los videojuegos (GET)
  // ==========================================
  getVideojuegos(): Observable<Videojuego[]> {
    return this.http.get<Videojuego[]>(this.apiUrl);
  }

  // ==========================================
  // 2. Obtener un videojuego por ID (GET)
  // ==========================================
  getJuego(id: number): Observable<Videojuego> {
    // Django exige el slash al final: /api/videojuegos/1/
    return this.http.get<Videojuego>(`${this.apiUrl}${id}/`);
  }

  // ==========================================
  // 3. Crear un nuevo videojuego (POST)
  // ==========================================
  crearJuego(juego: any): Observable<any> {
    return this.http.post(this.apiUrl, juego);
  }

  // ==========================================
  // 4. Actualizar datos de un videojuego (PUT)
  // ==========================================
  actualizarJuego(id: number, juego: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, juego);
  }

  // ==========================================
  // 5. Desactivar/Eliminar un videojuego (DELETE)
  // ==========================================
  eliminarJuego(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // ==========================================
  // 6. Reactivar un videojuego (PUT)
  // ==========================================
  activarJuego(id: number): Observable<any> {
    // Django estructura las acciones así: /api/videojuegos/1/activar/
    return this.http.put(`${this.apiUrl}${id}/activar/`, {});
  }
}