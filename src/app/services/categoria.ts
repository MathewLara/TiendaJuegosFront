import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../interfaces/categoria'; 

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7296/api/Categorias';

  constructor() { }

  // 1. Listar
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // 2. Crear
  crearCategoria(categoria: any): Observable<any> {
    return this.http.post(this.apiUrl, categoria);
  }

  // 3. Editar (Sirve para cambiar nombre o reactivar si mandamos activo: true)
  actualizarCategoria(id: number, categoria: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categoria);
  }

  // 4. Eliminar (Desactivar)
  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  // 5. Reactivar
  activarCategoria(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/activar/${id}`, {});
  }
}