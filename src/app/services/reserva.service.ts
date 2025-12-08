import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Reserva } from '../interfaces/reserva';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  // URL basada en el controlador
  private apiUrl = 'https://localhost:7296/api/Reservas'; 

  constructor() { }

  //1. Para la landing(publico) 
  crearReserva(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
  // 2. Para el Vendedor (Intranet) - Listar todas
  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  // 3. Cancelar Reserva (Devuelve stock)
  cancelarReserva(id: number): Observable<any> {
    // Ponemos responseType: 'text' por si el backend devuelve texto plano
    return this.http.put(`${this.apiUrl}/cancelar/${id}`, {}, { responseType: 'text' });
  }
}