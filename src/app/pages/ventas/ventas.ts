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
  clienteCedula = ''; 

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

// --- FUNCIÓN ARREGLADA: BUSCAR RESERVA ---
  buscarReserva() {
    if (!this.busquedaCodigo.trim()) return;

    this.reservaService.getReservas().subscribe({
      // AGREGAMOS : any[] para que VS Code no marque error rojo
      next: (reservas: any[]) => {
        // Buscamos usando el nombre exacto que viene de Python: codigo_reserva
        const reservaEncontrada = reservas.find(r => 
          r.codigo_reserva === this.busquedaCodigo.trim()
        );

        if (reservaEncontrada && (reservaEncontrada.estado === 'Pendiente' || reservaEncontrada.estado?.toLowerCase() === 'pendiente')) {
          
          this.esVentaDeReserva = true;
          // Guardamos los datos usando los nombres de Python
          this.codigoReservaActivo = reservaEncontrada.codigo_reserva;
          this.clienteNombre = reservaEncontrada.cliente_nombre;
          this.clienteCedula = reservaEncontrada.cliente_cedula;
          
          const idJuego = reservaEncontrada.videojuego;

          this.carrito = [{
            videojuegoId: idJuego,
            titulo: 'Juego Reservado', 
            precioUnitario: 0, 
            cantidad: reservaEncontrada.cantidad,
            subtotal: 0
          }];

          const juegoOriginal = this.listaJuegos.find(j => j.id === idJuego);
          if (juegoOriginal) {
            this.carrito[0].titulo = juegoOriginal.titulo;
            this.carrito[0].precioUnitario = juegoOriginal.precio;
            this.carrito[0].subtotal = juegoOriginal.precio * this.carrito[0].cantidad;
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
            text: 'No existe o no está pendiente.',
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
    this.clienteCedula = ''; // <-- Agregamos esto para que se borre la cédula
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

  // --- FUNCIÓN ARREGLADA: FINALIZAR VENTA ---
  finalizarVenta() {
    if (this.carrito.length === 0) return;

    // 1. VALIDACIÓN FRONTAL: No dejamos que envíe a Django si la cédula no tiene 10 números
    if (!this.clienteCedula || this.clienteCedula.length !== 10) {
      Swal.fire({
        title: 'FALTA LA CÉDULA',
        text: 'Por favor, ingresa una cédula válida de 10 dígitos antes de cobrar.',
        icon: 'warning',
        background: '#111', color: '#fff'
      });
      return; // Detenemos la venta aquí mismo
    }

    const usuarioLogueado = this.authService.getUsuarioActual();

    // 2. EMPAQUETADO CORRECTO (Sin nulls)
    const paqueteParaDjango = {
      cliente_nombre: this.clienteNombre,
      cliente_cedula: this.clienteCedula, 
      usuario: usuarioLogueado?.user_id || 1, 
      codigo_reserva: this.esVentaDeReserva ? this.codigoReservaActivo : "", 
      
      // EL ARREGLO ESTÁ AQUÍ ABAJO:
      detalles: this.carrito.map(item => ({
        videojuego: item.videojuegoId,
        cantidad: item.cantidad,
        precio_unitario: item.precioUnitario
      }))
    };

    this.ventaService.crearVenta(paqueteParaDjango).subscribe({
      next: () => {
        Swal.fire({
          title: '¡VENTA COMPLETADA!',
          text: `Total cobrado: $${this.totalVenta.toFixed(2)}`,
          icon: 'success',
          background: '#111', color: '#fff',
          confirmButtonColor: '#ff00ff'
        });

        this.limpiarReserva(); 
        this.cargarJuegos(); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        
        let mensajeError = 'No se pudo procesar la venta';
        if (err.error && typeof err.error === 'object') {
           mensajeError = JSON.stringify(err.error); 
        } else if (typeof err.error === 'string') {
           mensajeError = err.error;
        }

        Swal.fire({
          title: 'ERROR EN BACKEND',
          text: mensajeError,
          icon: 'error',
          background: '#111', color: '#fff'
        });
      }
    });
  }
}