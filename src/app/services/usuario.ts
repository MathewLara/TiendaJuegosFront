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

  // URL base del controlador Usuarios en el backend
  private apiUrl = 'https://localhost:7296/api/Usuarios'; 

  constructor() { }

  // ==========================================
  // 1. Obtener la lista completa de usuarios (GET)
  // Retorna un Observable con un arreglo de usuarios
  // ==========================================
  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl);
  }

  // ==========================================
  // 2. Crear un nuevo usuario (POST)
  // Recibe el modelo UsuarioRegistro y devuelve la respuesta del backend
  // ==========================================
  crearUsuario(usuario: UsuarioRegistro): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, usuario);
  }

  // ==========================================
  // 3. Desactivar usuario (DELETE)
  // Generalmente no se elimina, solo se marca como inactivo en base de datos
  // Enviamos el id en la URL -> /Usuarios/{id}
  // ==========================================
  desactivarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // 4. Activar usuario (PUT)
  // Usa un endpoint especial: /Usuarios/activar/{id}
  // Mandamos un cuerpo vacío {} porque no se necesita enviar nada al backend
  // responseType: 'text' por si el backend devuelve un mensaje plano
  // ==========================================
  activarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/activar/${id}`, {}, { responseType: 'text' });
  }
}
