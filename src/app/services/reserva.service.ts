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

  // NUEVA URL BASE: Minúsculas y slash final obligatorio para Django
  private apiUrl = 'http://127.0.0.1:8000/api/reservas/'; 

  constructor() { }

  // ==========================================
  // 1. Crear una reserva (Público en la landing)
  // ==========================================
  crearReserva(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  // ==========================================
  // 2. Listar todas las reservas (Intranet - Vendedor)
  // ==========================================
  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  // ==========================================
  // 3. Cancelar una reserva (PUT)
  // ==========================================
  cancelarReserva(id: number): Observable<any> {
    // 1. El ID va antes de la acción: /api/reservas/1/cancelar/
    // 2. Quitamos el responseType:'text' porque Django siempre responde con JSON limpio
    return this.http.put(`${this.apiUrl}${id}/cancelar/`, {});
  }
}