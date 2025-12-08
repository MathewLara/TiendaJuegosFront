import { Component, ElementRef, inject, OnInit, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JuegoService } from '../../services/juego'; 
import { ReservaService } from '../../services/reserva.service';
import { Videojuego } from '../../interfaces/videojuego';
import Swal from 'sweetalert2';

declare var anime: any; 

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent implements OnInit, AfterViewInit {
  private juegoService = inject(JuegoService);
  private reservaService = inject(ReservaService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  listaJuegos: Videojuego[] = [];
  mostrarModal = false;
  juegoSeleccionado: Videojuego | null = null;
  datosCliente = { nombre: '', contacto: '', cantidad: 1 };

  // Variable para controlar la animación hover
  hoverAnimation: any;

  @ViewChildren('gameCard') gameCards!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.cargarJuegos();
    this.animarNumeros();
  }

  ngAfterViewInit() {
    this.gameCards.changes.subscribe(() => {
       this.animarEntrada();
    });
  }
  animarNumeros() {
    // Busca el elemento con clase .counter
    anime({
      targets: '.counter',
      innerHTML: [0, 500], // Cuenta de 0 a 500
      round: 1, // Sin decimales
      easing: 'easeInOutExpo',
      duration: 2000 // Tarda 2 segundos
    });
    
    // Animación suave para el título al entrar
    anime({
      targets: '.hero-content',
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 1000,
      easing: 'easeOutExpo',
      delay: 300
    });
  }
  scrollAbajo() {
    const catalogo = document.getElementById('catalogo');
    if (catalogo) {
      catalogo.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cargarJuegos() {
    this.juegoService.getVideojuegos().subscribe({
      next: (data) => {
       this.listaJuegos = data.filter(j => j.activo);
        
        //1. OBLIGAMOS A ANGULAR A PINTAR EL HTML YA
        this.cdr.detectChanges(); 

        // 2. AHORA SÍ, ANIMAMOS (Con un pequeño respiro de seguridad)
        setTimeout(() => this.animarEntrada(), 50);
      },
      error: (e) => console.error("Error cargando juegos:", e)
    });
  }

  animarEntrada() {
    // Si la lista está vacía o anime no cargó, esto evita el error
    if (this.gameCards && this.gameCards.length > 0) {
      try {
        anime({
          targets: '.card-juego',
          translateY: [50, 0],
          opacity: [0, 1],
          delay: anime.stagger(100),
          easing: 'easeOutQuad'
        });
      } catch (error) {
        console.error("Anime.js no está listo aún", error);
      }
    }
  }

  abrirReserva(juego: Videojuego) {
    this.juegoSeleccionado = juego;
    this.mostrarModal = true;
  }
  // 1. Efecto "Glitch/Temblor" al pasar el mouse
  efectoHover() {
    this.hoverAnimation = anime({
      targets: '.login-access',
      translateX: [
        { value: -2, duration: 50 },
        { value: 2, duration: 50 },
        { value: -1, duration: 50 },
        { value: 1, duration: 50 },
        { value: 0, duration: 50 }
      ],
      scale: [1, 1.05],
      easing: 'linear',
      loop: true // Tiembla infinitamente mientras estás encima
    });
  }

  pausarHover() {
    if (this.hoverAnimation) {
      this.hoverAnimation.pause(); // Detener temblor
      anime({ targets: '.login-access', scale: 1, translateX: 0 }); // Resetear
    }
  }

  // 2. Transición ÉPICA de salida
  irALogin() {
    // A. Detenemos cualquier hover
    this.pausarHover();

    // B. Secuencia de salida
    const timeline = anime.timeline({
      easing: 'easeInExpo',
      duration: 500
    });

    timeline
    // El botón se expande y se pone rojo
    .add({
      targets: '.login-access',
      borderColor: '#ff0000',
      color: '#ff0000',
      scale: 1.2,
      duration: 300
    })
    // Las tarjetas de juego caen al vacío una por una
    .add({
      targets: '.card-juego',
      translateY: 1000, // Caen hacia abajo
      opacity: 0,
      delay: anime.stagger(100), // Efecto cascada (una tras otra)
      duration: 800
    })
    // El título desaparece
    .add({
      targets: '.hero h1',
      opacity: 0,
      scale: 0.1,
      duration: 400
    }, '-=600'); // Empieza un poco antes

    // C. Navegar al terminar la animación
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500); // Tiempo suficiente para ver la destrucción
  }

  confirmarReserva() {
    if (!this.juegoSeleccionado) return;

    const reservaDTO = {
      videojuegoId: this.juegoSeleccionado.id,
      clienteNombre: this.datosCliente.nombre,
      clienteContacto: this.datosCliente.contacto,
      cantidad: this.datosCliente.cantidad
    };

    this.reservaService.crearReserva(reservaDTO).subscribe({
      next: (resp) => {
        // Cierra el modal de Angular primero
        this.mostrarModal = false; 

        // Lanza la alerta Gamer
        Swal.fire({
          title: '¡Juego Apartado!',
          text: `Tu código de reserva es: ${resp.codigoReserva}`,
          icon: 'success',
          confirmButtonText: 'ENTENDIDO',
          background: '#1a1a1a', // Respaldo por si falla el CSS global
          color: '#fff'
        });

        this.cargarJuegos(); // Recargamos stock
      },
      error: (err) => {
        Swal.fire({
          title: 'GAME OVER',
          text: 'No se pudo completar la reserva: ' + (err.error || 'Error desconocido'),
          icon: 'error',
          confirmButtonText: 'REINTENTAR',
          background: '#1a1a1a',
          color: '#fff'
        });
      }
    });
  }
}