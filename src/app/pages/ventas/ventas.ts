import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JuegoService } from '../../services/juego';
import { VentaService } from '../../services/venta';
import { AuthService } from '../../services/auth';
import { ReservaService } from '../../services/reserva.service'; 
import { Videojuego } from '../../interfaces/videojuego';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class VentasComponent implements OnInit {
  private juegoService = inject(JuegoService);
  private ventaService = inject(VentaService);
  private reservaService = inject(ReservaService); 
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  listaJuegos: Videojuego[] = [];
  carrito: any[] = []; 
  totalVenta = 0;
  clienteNombre = 'Consumidor Final';

  // NUEVAS VARIABLES PARA RESERVA
  busquedaCodigo = '';        // El texto del input
  codigoReservaActivo = '';   // El código si encontramos uno válido
  esVentaDeReserva = false;   // Para bloquear cosas si viene de reserva

  ngOnInit(): void {
    this.cargarJuegos();
  }

  cargarJuegos() {
    this.juegoService.getVideojuegos().subscribe({
      next: (data) => {
        this.listaJuegos = data.filter(j => j.activo);
        this.cdr.detectChanges(); 
      },
      error: (e) => console.error(e)
    });
  }

  // --- NUEVA FUNCIÓN: BUSCAR RESERVA ---
  buscarReserva() {
    if (!this.busquedaCodigo.trim()) return;

    // Buscamos en todas las reservas (idealmente el backend tendría un endpoint buscarPorCodigo, 
    // pero podemos filtrar aquí ya que tienes getReservas)
    this.reservaService.getReservas().subscribe({
      next: (reservas) => {
        // Buscamos la reserva exacta
        const reservaEncontrada = reservas.find(r => r.codigoReserva === this.busquedaCodigo.trim());

        if (reservaEncontrada && reservaEncontrada.estado === 'Pendiente') {
          
          // 1. Cargamos los datos
          this.esVentaDeReserva = true;
          this.codigoReservaActivo = reservaEncontrada.codigoReserva ||'';
          this.clienteNombre = reservaEncontrada.clienteNombre;

          // 2. Llenamos el carrito mágicamente
          this.carrito = [{
            videojuegoId: reservaEncontrada.videojuegoId,
            titulo: reservaEncontrada.videojuegoTitulo,
            // Nota: ReservaDTO a veces no trae precio, usaremos el del juego actual si es posible
            // o asumimos que el precio no cambió.
            precioUnitario: 0, // Lo corregiremos abajo buscando en la lista de juegos
            cantidad: reservaEncontrada.cantidad,
            subtotal: 0
          }];

          // Buscamos el precio real en nuestra lista de juegos cargada
          const juegoOriginal = this.listaJuegos.find(j => j.id === reservaEncontrada.videojuegoId);
          if (juegoOriginal) {
            this.carrito[0].precioUnitario = juegoOriginal.precio;
            this.carrito[0].subtotal = juegoOriginal.precio * reservaEncontrada.cantidad;
          }

          this.calcularTotal();
          this.cdr.detectChanges();

          Swal.fire({
            title: 'RESERVA ENCONTRADA',
            text: `Cliente: ${this.clienteNombre}`,
            icon: 'success',
            background: '#111', color: '#fff',
            timer: 2000, showConfirmButton: false
          });

        } else {
          Swal.fire({
            title: 'CÓDIGO INVÁLIDO',
            text: 'No existe o ya fue completada/cancelada.',
            icon: 'error',
            background: '#111', color: '#fff'
          });
        }
      }
    });
  }

  // --- NUEVA FUNCIÓN: LIMPIAR SI SE ARREPIENTE ---
  limpiarReserva() {
    this.esVentaDeReserva = false;
    this.codigoReservaActivo = '';
    this.busquedaCodigo = '';
    this.carrito = [];
    this.clienteNombre = 'Consumidor Final';
    this.calcularTotal();
    this.cdr.detectChanges();
  }

  agregarAlCarrito(juego: Videojuego) {
    // Si estamos atendiendo una reserva, no dejamos mezclar juegos extra (opcional)
    if (this.esVentaDeReserva) {
      Swal.fire({ title: 'MODO RESERVA', text: 'Finaliza esta reserva antes de agregar otros items.', icon: 'info', background: '#111', color: '#fff' });
      return;
    }

    if (juego.stock <= 0) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Sin Stock', timer: 1500, background: '#111', color: '#fff' });
      return;
    }

    const itemExistente = this.carrito.find(item => item.videojuegoId === juego.id);

    if (itemExistente) {
      if (itemExistente.cantidad < juego.stock) {
        itemExistente.cantidad++;
        itemExistente.subtotal = itemExistente.cantidad * juego.precio;
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Stock máximo alcanzado', timer: 1500, background: '#111', color: '#fff' });
      }
    } else {
      this.carrito.push({
        videojuegoId: juego.id,
        titulo: juego.titulo,
        precioUnitario: juego.precio,
        cantidad: 1,
        subtotal: juego.precio
      });
    }

    this.calcularTotal();
    this.cdr.detectChanges();
  }

  eliminarDelCarrito(index: number) {
    if (this.esVentaDeReserva) {
        this.limpiarReserva(); // Si borra el item de reserva, reseteamos todo
        return;
    }
    this.carrito.splice(index, 1);
    this.calcularTotal();
    this.cdr.detectChanges();
  }

  calcularTotal() {
    this.totalVenta = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  finalizarVenta() {
    if (this.carrito.length === 0) return;

    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioGamer') || '{}');

    const ventaDTO = {
      clienteNombre: this.clienteNombre,
      usuarioId: usuarioLogueado.id || 1,
      // IMPORTANTE: Enviamos el código si existe
      codigoReserva: this.esVentaDeReserva ? this.codigoReservaActivo : null, 
      detalles: this.carrito.map(item => ({
        videojuegoId: item.videojuegoId,
        cantidad: item.cantidad
      }))
    };

    this.ventaService.crearVenta(ventaDTO).subscribe({
      next: () => {
        Swal.fire({
          title: '¡VENTA COMPLETADA!',
          text: `Total cobrado: $${this.totalVenta.toFixed(2)}`,
          icon: 'success',
          background: '#111', color: '#fff',
          confirmButtonColor: '#ff00ff'
        });

        // Limpiamos todo
        this.limpiarReserva(); // Esto resetea variables y carrito
        this.cargarJuegos(); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          title: 'ERROR',
          text: err.error || 'No se pudo procesar la venta',
          icon: 'error',
          background: '#111', color: '#fff'
        });
      }
    });
  }
}