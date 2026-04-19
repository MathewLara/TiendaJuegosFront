import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../interfaces/venta'; 

// Servicio disponible en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class VentaService {

  // Inyectamos HttpClient usando la función inject
  private http = inject(HttpClient);

  // NUEVA URL BASE: Apuntamos a Django con minúsculas y el slash final
  private apiUrl = 'http://127.0.0.1:8000/api/ventas/'; 

  constructor() { }

  // ==========================================
  // 1. Registrar una nueva venta (POST)
  // Enviamos el objeto "venta" al backend
  // El backend se encarga de guardar y descontar stock de forma segura
  // ==========================================
  crearVenta(venta: any): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  // ==========================================
  // 2. Obtener el historial de ventas (GET)
  // Devuelve un arreglo de ventas registradas
  // ==========================================
  getHistorial(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}estadisticas/`);
  }
}