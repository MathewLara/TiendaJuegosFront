import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Videojuego } from '../interfaces/videojuego';

@Injectable({
  providedIn: 'root'
})
export class JuegoService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7296/api/Videojuegos'; 

  constructor() { }

  // 1. Listar
  getVideojuegos(): Observable<Videojuego[]> {
    return this.http.get<Videojuego[]>(this.apiUrl);
  }

  // 2. Obtener uno por ID (Para buscar)
  getJuego(id: number): Observable<Videojuego> {
    return this.http.get<Videojuego>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear
  crearJuego(juego: any): Observable<any> {
    return this.http.post(this.apiUrl, juego);
  }

  // 4. Editar (PUT)
  actualizarJuego(id: number, juego: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, juego);
  }

  // 5. Desactivar/Eliminar (DELETE)
  eliminarJuego(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 6. Reactivar juego
  activarJuego(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/activar/${id}`, {});
  }
}