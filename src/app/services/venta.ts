import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../interfaces/venta'; 

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7296/api/Ventas'; 

  constructor() { }

  // 1. Registrar una nueva venta
  crearVenta(venta: any): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  // 2. Obtener historial 
  getHistorial(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}