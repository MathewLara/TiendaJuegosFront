import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Reserva } from '../interfaces/reserva';

// Servicio disponible en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  // Inyectamos HttpClient usando la función inject 
  private http = inject(HttpClient);

  // URL base del controlador de Reservas en el backend
  private apiUrl = 'https://localhost:7296/api/Reservas'; 

  constructor() { }

  // ==========================================
  // 1. Crear una reserva (Público en la landing)
  // Este método se usa desde la página principal, no requiere login
  // Envía los datos del formulario al backend mediante POST
  // ==========================================
  crearReserva(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  // ==========================================
  // 2. Listar todas las reservas (Intranet - Vendedor)
  // Retorna un Observable con un arreglo de reservas
  // Este endpoint normalmente está protegido y solo lo ve personal interno
  // ==========================================
  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  // ==========================================
  // 3. Cancelar una reserva (PUT)
  // Al cancelar una reserva, el backend actualiza el estado y devuelve el stock
  // Se manda un cuerpo vacío {} porque no necesitamos enviar datos extra
  // Se especifica responseType: 'text' por si el backend responde con texto simple
  // ==========================================
  cancelarReserva(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/cancelar/${id}`, 
      {},
      { responseType: 'text' }
    );
  }
}
