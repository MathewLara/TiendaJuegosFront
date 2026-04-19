import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioRegistro, UsuarioResponse } from '../interfaces/usuario';

// Hacemos que el servicio esté disponible globalmente en la app
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  // Inyectamos HttpClient usando la función inject
  private http = inject(HttpClient);

  // NUEVA URL BASE: Apuntamos a Django con minúsculas y el slash final
  private apiUrl = 'http://127.0.0.1:8000/api/usuarios/'; 

  constructor() { }

  // ==========================================
  // 1. Obtener la lista completa de usuarios (GET)
  // ==========================================
  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl);
  }

  // ==========================================
  // 2. Crear un nuevo usuario (POST)
  // ==========================================
  crearUsuario(usuario: UsuarioRegistro): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, usuario);
  }

  // ==========================================
  // 3. Desactivar usuario (DELETE)
  // ==========================================
  desactivarUsuario(id: number): Observable<void> {
    // Agregamos el ID directamente y cerramos con el slash: /api/usuarios/1/
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // ==========================================
  // 4. Activar usuario (PUT)
  // ==========================================
  activarUsuario(id: number): Observable<any> {
    // 1. La acción requiere el ID primero: /api/usuarios/1/activar/
    // 2. Quitamos responseType:'text' porque Django siempre manda JSON
    return this.http.put(`${this.apiUrl}${id}/activar/`, {});
  }
}