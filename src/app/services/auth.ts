import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UsuarioRegistro, UsuarioResponse } from '../interfaces/usuario'; 

//Este servicio maneja toda la lógica de autenticación: login, logout y estado de sesión.
// El login hace una petición POST al backend y, si es exitosa, guarda la info en memoria y en localStorage.
// Con eso mantenemos la sesión aunque recargue la página.

// Marcamos la clase como un servicio disponible en toda la app
@Injectable({ providedIn: 'root' })
export class AuthService {

  // Inyectamos HttpClient usando la función inject (forma moderna de Angular)
  private http = inject(HttpClient);

  // URL del endpoint donde se hace el login en el backend
  private apiUrl = 'https://localhost:7296/api/Auth/login'; 

  // Variable interna para guardar temporalmente los datos del usuario logueado
  private usuarioActual: UsuarioResponse | null = null;

  constructor() { }

  // Método para iniciar sesión
  // Recibe credenciales (email y password) y devuelve un Observable con la respuesta del backend
  login(credenciales: any): Observable<UsuarioResponse> {

    // Hacemos una petición POST al backend enviando las credenciales
    return this.http.post<UsuarioResponse>(this.apiUrl, credenciales).pipe(

      // tap nos permite ejecutar acciones sin alterar la respuesta del Observable
      //Un Observable es una fuente de datos que llega en el tiempo.
      // Angular usa Observables porque el backend no responde instantáneamente.”
      tap((usuario) => {

        // Guardamos los datos del usuario en memoria
        this.usuarioActual = usuario;

        // Guardamos al usuario en localStorage para mantener la sesión incluso si se recarga la página
        localStorage.setItem('usuarioGamer', JSON.stringify(usuario));
      })
    );
  }

  // Método para cerrar sesión
  logout() {

    // Borramos el usuario en memoria
    this.usuarioActual = null;

    // Quitamos también el usuario del localStorage
    localStorage.removeItem('usuarioGamer');
  }

  // Método que permite saber si el usuario está logueado
  estaLogueado(): boolean {

    // Devuelve true si hay un usuario en memoria o si está guardado en localStorage
    return !!this.usuarioActual || !!localStorage.getItem('usuarioGamer');
  }
}