import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { VentaService } from '../../services/venta';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './inicio.html',  // <--- Le quitamos el .component
  styleUrl: './inicio.css'       // <--- Le quitamos el .component
})
export class InicioComponent implements OnInit {
  private ventaService = inject(VentaService);
  
  // Datos iniciales para que no explote la pantalla mientras carga
  stats: any = { 
    total_ganancias: 0, 
    ventas_hoy: 0, 
    poco_stock: [] 
  };

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.ventaService.getEstadisticas().subscribe({
      next: (data) => {
        console.log('Datos recibidos del server:', data); // Esto es para que veas en la consola (F12) si llegan datos
        // Asignamos asegurándonos de que si vienen nulos, se mantengan en 0
        this.stats = {
          total_ganancias: data.total_ganancias || 0,
          ventas_hoy: data.ventas_hoy || 0,
          poco_stock: data.poco_stock || []
        };
      },
      error: (e) => console.error('Error al cargar stats:', e)
    });
  }
}