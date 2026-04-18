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

  // URL base del controlador de Ventas en el backend
  private apiUrl = 'https://localhost:7296/api/Ventas'; 

  constructor() { }

  // ==========================================
  // 1. Registrar una nueva venta (POST)
  // Enviamos el objeto "venta" al backend
  // El backend se encarga de guardar y descontar stock
  // ==========================================
  crearVenta(venta: any): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  // ==========================================
  // 2. Obtener el historial de ventas (GET)
  // Devuelve un arreglo de ventas registradas
  // Usado en la intranet para reportes o listados
  // ==========================================
  getHistorial(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
