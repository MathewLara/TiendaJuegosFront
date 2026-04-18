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

  // URL base del controlador de Videojuegos en el backend
  private apiUrl = 'https://localhost:7296/api/Videojuegos'; 

  constructor() { }

  // ==========================================
  // 1. Listar todos los videojuegos (GET)
  // Retorna un Observable con un arreglo de videojuegos
  // ==========================================
  getVideojuegos(): Observable<Videojuego[]> {
    return this.http.get<Videojuego[]>(this.apiUrl);
  }

  // ==========================================
  // 2. Obtener un videojuego por ID (GET)
  // Útil cuando necesitamos buscar o cargar datos en el formulario de edición
  // ==========================================
  getJuego(id: number): Observable<Videojuego> {
    return this.http.get<Videojuego>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // 3. Crear un nuevo videojuego (POST)
  // Enviamos el objeto "juego" al backend para que lo registre
  // ==========================================
  crearJuego(juego: any): Observable<any> {
    return this.http.post(this.apiUrl, juego);
  }

  // ==========================================
  // 4. Actualizar datos de un videojuego (PUT)
  // Se usa cuando editamos información o reactivamos si enviamos un campo activo: true
  // ==========================================
  actualizarJuego(id: number, juego: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, juego);
  }

  // ==========================================
  // 5. Desactivar/Eliminar un videojuego (DELETE)
  // Normalmente en la base no se borra del todo, solo se marca como inactivo
  // ==========================================
  eliminarJuego(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // 6. Reactivar un videojuego (PUT)
  // Endpoint especial: /activar/{id}
  // Enviamos un cuerpo vacío porque el backend ya sabe qué hacer
  // ==========================================
  activarJuego(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/activar/${id}`, {});
  }
}
