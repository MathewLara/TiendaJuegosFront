import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; 

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Inyectamos HttpClient usando la función moderna inject 
  private http = inject(HttpClient);

  // NUEVA URL: Apunta a tu servidor de Django
  private apiUrl = 'http://127.0.0.1:8000/api/auth/login/'; 

  constructor() { }

  // Método para iniciar sesión
  login(credenciales: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, credenciales).pipe(
      tap((response) => {
        // Django nos devuelve dos tokens. Los guardamos en la "caja fuerte" del navegador.
        // Ya no guardamos el objeto del usuario directamente por seguridad.
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      })
    );
  }

  // Método para cerrar sesión
  logout() {
    // Destruimos las llaves de seguridad
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Método que permite saber si el usuario está logueado
  estaLogueado(): boolean {
    // Si la llave maestra existe, asumimos que está logueado
    return !!localStorage.getItem('access_token');
  }

  // Utilidad para obtener el token puro (lo usará el Interceptor)
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // NUEVO MÉTODO: Como el token está encriptado, lo decodificamos
  // para obtener el nombre, email y rol que inyectaste en Python.
  getUsuarioActual(): any {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}