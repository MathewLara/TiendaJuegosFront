import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../services/venta';
import { Venta } from '../../interfaces/venta';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule], // Importante para *ngFor y pipes de fecha/moneda
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.css'
})
export class HistorialVentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private cdr = inject(ChangeDetectorRef);

  listaVentas: Venta[] = [];
  ventaSeleccionada: Venta | null = null; // Para el modal de detalles
  mostrarModal = false;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.ventaService.getHistorial().subscribe({
      next: (data) => {
        this.listaVentas = data;
        console.log('Historial cargado:', data);
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }

  verDetalle(venta: Venta) {
    this.ventaSeleccionada = venta;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.ventaSeleccionada = null;
    this.cdr.detectChanges();
  }
}