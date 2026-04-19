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
        this.stats = data;
      },
      error: (e) => console.error('Error al cargar stats:', e)
    });
  }
}