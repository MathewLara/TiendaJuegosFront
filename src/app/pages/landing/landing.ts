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
  datosCliente = { nombre: '', contacto: '', cedula: '', cantidad: 1 };

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

  // 2. Transición de salida
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
    }, '-=600');

    // C. Navegar al terminar la animación
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500); 
  }

  confirmarReserva() {
    if (!this.juegoSeleccionado) return;

    // 1. Calculamos la fecha de expiración que C# hacía automático pero Python no (ej. 3 días)
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 3);
    const fechaExpiracion = fecha.toISOString().split('T')[0];

    // 2. TRADUCTOR: Empaquetamos EXACTAMENTE con los nombres (snake_case) que pide Django
    const paqueteParaDjango = {
      videojuego: this.juegoSeleccionado.id,          // Django pide "videojuego", no "videojuegoId"
      cliente_nombre: this.datosCliente.nombre,       // Django pide "cliente_nombre"
      cliente_contacto: this.datosCliente.contacto,   // Django pide "cliente_contacto"
      cliente_cedula: this.datosCliente.cedula,       // ¡Aquí mandamos la cédula!
      fecha_expiracion: fechaExpiracion,              // El dato nuevo obligatorio
      cantidad: this.datosCliente.cantidad || 1       // Lo dejamos por si tu backend lo usa
    };

    // 3. Enviamos el paquete traducido
    this.reservaService.crearReserva(paqueteParaDjango).subscribe({
      next: (resp) => {
        // Cierra el modal de Angular primero
        this.mostrarModal = false; 

        // Lanza la alerta Gamer (¡Mantenemos tu diseño que está pepa!)
        Swal.fire({
          title: '¡Juego Apartado!',
          // Si Django no manda codigoReserva, ponemos un texto por defecto
          text: resp.codigoReserva ? `Tu código de reserva es: ${resp.codigoReserva}` : 'Reserva completada con éxito.',
          icon: 'success',
          confirmButtonText: 'ENTENDIDO',
          background: '#1a1a1a', 
          color: '#fff'
        });

        this.cargarJuegos(); // Recargamos stock
      },
      error: (err) => {
    console.error("Error capturado del backend:", err);

    // 1. Extraer correctamente el mensaje de Django
    let mensaje = "No se pudo procesar la reserva. Verifica los datos.";
    
    if (err.error && typeof err.error === 'object') {
      const keys = Object.keys(err.error);
      if (keys.length > 0) {
        const primerError = err.error[keys[0]];
        mensaje = Array.isArray(primerError) ? primerError[0] : primerError;
      }
    } else if (typeof err.error === 'string') {
      mensaje = err.error;
    }

    // 2. Lanzar alerta FORZANDO que se ponga encima del modal oscuro
    Swal.fire({
      title: 'ERROR DE VALIDACIÓN',
      text: String(mensaje),
      icon: 'error',
      background: '#111',
      color: '#fff',
      confirmButtonColor: '#ff00ff',
      
      // TRUCO SUPREMO: Esto empuja la alerta de SweetAlert hacia adelante
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
        if (swalContainer) {
          swalContainer.style.zIndex = '999999';
        }}
    });
  }
})}}