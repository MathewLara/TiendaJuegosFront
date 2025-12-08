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
      next: (data) => {
        this.listaReservas = data;
 
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

            reserva.estado = 'Cancelada';
            
            // Forzamos el cambio visual
            this.cdr.detectChanges(); 

            Swal.fire({
              title: 'STOCK LIBERADO',
              text: 'El juego vuelve a estar disponible para venta.',
              icon: 'success',
              background: '#111', color: '#fff'
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({ title: 'Error', text: 'No se pudo cancelar', icon: 'error', background: '#111', color: '#fff' });
          }
        });

      }
    });
  }
}