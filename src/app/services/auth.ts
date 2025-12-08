import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UsuarioRegistro, UsuarioResponse } from '../interfaces/usuario'; 

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7296/api/Auth/login'; 
  private usuarioActual: UsuarioResponse | null = null;

  constructor() { }

  // 👇 CAMBIO AQUÍ: Cambiamos el tipo a 'any' para ser flexibles
  login(credenciales: any): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, credenciales).pipe(
      tap((usuario) => {
        this.usuarioActual = usuario;
        localStorage.setItem('usuarioGamer', JSON.stringify(usuario));
      })
    );
  }

  logout() {
    this.usuarioActual = null;
    localStorage.removeItem('usuarioGamer');
  }

  estaLogueado(): boolean {
    // Verificamos si hay usuario en memoria o en localStorage
    return !!this.usuarioActual || !!localStorage.getItem('usuarioGamer');
  }
}