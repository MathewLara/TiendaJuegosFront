import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../interfaces/reserva';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class ReservasComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private cdr = inject(ChangeDetectorRef); 

  listaReservas: Reserva[] = [];

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas() {
    this.reservaService.getReservas().subscribe({
      // Usamos any[] para que no moleste el tipado estricto
      next: (data: any[]) => {
        
        // TRADUCTOR: Transformamos de snake_case (Django) a camelCase (Angular)
        this.listaReservas = data.map(r => ({
          id: r.id,
          codigoReserva: r.codigo_reserva,
          clienteNombre: r.cliente_nombre,
          cedula: r.cliente_cedula, // Tu nueva variable
          clienteContacto: r.cliente_contacto,
          fechaReserva: r.fecha_reserva,
          fechaExpiracion: r.fecha_expiracion,
          estado: r.estado,
          videojuegoId: r.videojuego,
          videojuegoTitulo: r.videojuego_titulo || 'Juego Desconocido', // El título que acabamos de pedir
          cantidad: r.cantidad
        }));
 
        console.log('Reservas cargadas y traducidas:', this.listaReservas);
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }

  cancelar(reserva: Reserva) {
    Swal.fire({
      title: '¿CANCELAR PEDIDO?',
      text: `Se liberará el stock de: ${reserva.videojuegoTitulo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'SÍ, LIBERAR STOCK',
      cancelButtonText: 'NO, ESPERAR',
      confirmButtonColor: '#d33',
      background: '#111', color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.reservaService.cancelarReserva(reserva.id).subscribe({
          next: () => {
            // Si Angular lo entiende a la primera
            reserva.estado = 'Cancelada';
            this.cdr.detectChanges(); 

            Swal.fire({
              title: 'STOCK LIBERADO',
              text: 'El juego vuelve a estar disponible para venta.',
              icon: 'success',
              background: '#111', color: '#fff'
            });
          },
          error: (err) => {
            console.error('Error completo:', err);
            
            // EL TRUCO: Si el backend respondió 200 OK, pero Angular se confundió leyendo el texto
            // lo tomamos como una victoria absoluta.
            if (err.status === 200 || err.status === 201) {
               reserva.estado = 'Cancelada';
               this.cdr.detectChanges(); 
               Swal.fire({
                  title: 'STOCK LIBERADO',
                  text: 'El juego vuelve a estar disponible para venta.',
                  icon: 'success',
                  background: '#111', color: '#fff'
               });
               return; // Detenemos el error aquí
            }

            // Si es un error de verdad, obligamos a que nos diga el motivo exacto
            let mensajeError = 'No se pudo cancelar';
            if (err.error && typeof err.error === 'object') {
               mensajeError = JSON.stringify(err.error);
            } else if (typeof err.error === 'string') {
               mensajeError = err.error;
            } else if (err.message) {
               mensajeError = err.message;
            }

            Swal.fire({ 
              title: 'ERROR EN BACKEND', 
              text: mensajeError, 
              icon: 'error', 
              background: '#111', 
              color: '#fff' 
            });
          }
        });

      }
    });
  }
}