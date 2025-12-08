import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioRegistro, UsuarioResponse } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7296/api/Usuarios'; 

  constructor() { }

  // 1. Listar todos
  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl);
  }

  // 2. Crear uno nuevo
  crearUsuario(usuario: UsuarioRegistro): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, usuario);
  }

  // 3. Desactivar (DELETE)
  desactivarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 4. Activar (PUT)
  activarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/activar/${id}`, {}, { responseType: 'text' });
  }
}