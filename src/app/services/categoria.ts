import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../interfaces/categoria'; 

// Hacemos que el servicio esté disponible en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  // Inyectamos HttpClient usando la función inject 
  private http = inject(HttpClient);

  // NUEVA URL BASE: Apuntamos a Django con minúsculas y el slash final
  private apiUrl = 'http://127.0.0.1:8000/api/categorias/';

  constructor() { }

  // ==========================================
  // 1. Obtener todas las categorías (GET)
  // ==========================================
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // ==========================================
  // 2. Crear una nueva categoría (POST)
  // ==========================================
  crearCategoria(categoria: any): Observable<any> {
    return this.http.post(this.apiUrl, categoria);
  }

  // ==========================================
  // 3. Editar/Actualizar una categoría (PUT)
  // ==========================================
  actualizarCategoria(id: number, categoria: any): Observable<any> {
    // Agregamos el ID directamente a la url y cerramos con el slash
    return this.http.put(`${this.apiUrl}${id}/`, categoria);
  }

  // ==========================================
  // 4. "Eliminar" categoría (DELETE) (Soft Delete en Django)
  // ==========================================
  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // ==========================================
  // 5. Reactivar una categoría (PUT)
  // ==========================================
  activarCategoria(id: number): Observable<any> {
    // La acción "@action" de Django requiere el ID primero: /api/categorias/1/activar/
    return this.http.put(`${this.apiUrl}${id}/activar/`, {});
  }
}