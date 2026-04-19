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
      next: (data: any[]) => {
        // TRADUCTOR: Mapeamos los nombres de Django (snake_case) a los de Angular (CamelCase)
        this.listaVentas = data.map(v => ({
          id: v.id,
          fechaVenta: v.fecha_venta,
          total: parseFloat(v.total),
          codigoReserva: v.codigo_reserva,
          clienteNombre: v.cliente_nombre,
          usuarioId: v.usuario,
          usuarioNombre: v.usuario_nombre || 'Vendedor',
          
          // Traducimos también los items del modal
          detalles: v.detalles.map((d: any) => ({
            videojuegoId: d.videojuego,
            videojuegoTitulo: d.videojuego_titulo, // Ahora sí viene desde Django
            cantidad: d.cantidad,
            precioUnitario: parseFloat(d.precio_unitario),
            subtotal: d.cantidad * parseFloat(d.precio_unitario)
          }))
        }));

        console.log('Historial traducido:', this.listaVentas);
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