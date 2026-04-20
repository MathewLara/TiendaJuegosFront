import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../services/venta';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css' 
})
export class InicioComponent implements OnInit {

  private ventaService = inject(VentaService);
  private cdr = inject(ChangeDetectorRef);

  // LA CORRECCIÓN: Creamos la variable 'stats' exactamente como la pide tu HTML
  stats: any = null; 
  
  cargando: boolean = true;
  errorCarga: boolean = false;

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargando = true;
    this.ventaService.getEstadisticas().subscribe({
      next: (data: any) => {
        console.log("Datos del backend (Django):", data); 
        
        // Asignamos toda la respuesta del backend directamente a la variable 'stats'
        this.stats = data;
        
        this.cargando = false;
        this.errorCarga = false;
        
        // Forzamos la actualización de la pantalla
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Error al cargar estadísticas:", err);
        this.cargando = false;
        this.errorCarga = true;
        this.stats = null;
      }
    });
  }
}