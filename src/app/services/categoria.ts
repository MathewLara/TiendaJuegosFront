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

  // URL base del controlador de Categorías en el backend
  private apiUrl = 'https://localhost:7296/api/Categorias';

  constructor() { }

  // ==========================================
  // 1. Obtener todas las categorías (GET)
  // Este método devuelve un Observable con un arreglo de categorías
  // ==========================================
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // ==========================================
  // 2. Crear una nueva categoría (POST)
  // Enviamos un objeto "categoria" al backend
  // ==========================================
  crearCategoria(categoria: any): Observable<any> {
    return this.http.post(this.apiUrl, categoria);
  }

  // ==========================================
  // 3. Editar/Actualizar una categoría (PUT)
  // Se puede usar tanto para cambiar el nombre como para reactivarla
  // El backend interpreta qué actualizar según el cuerpo enviado
  // ==========================================
  actualizarCategoria(id: number, categoria: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categoria);
  }

  // ==========================================
  // 4. "Eliminar" categoría (DELETE)
  // Esto usualmente no borra la categoría, solo la desactiva en base de datos
  // ==========================================
  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // 5. Reactivar una categoría (PUT)
  // Llamamos un endpoint especial: /activar/{id}
  // Enviamos un cuerpo vacío porque no se necesita más info
  // ==========================================
  activarCategoria(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/activar/${id}`, {});
  }
}
