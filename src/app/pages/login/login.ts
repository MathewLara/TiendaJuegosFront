import { Component, ElementRef, ViewChild, AfterViewInit, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Para navegar tras el login
import Swal from 'sweetalert2'; //para las alertas
import { AuthService } from '../../services/auth';

// Declaramos la variable global
declare var anime: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements AfterViewInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  password = '';

  @ViewChild('loginBtn') loginBtn!: ElementRef;

  ngAfterViewInit() {
    // 1. ANIMACIÓN DE ENTRADA (System Boot)
    // Primero hacemos invisibles los elementos para que no parpadeen
    anime.set('.stagger-element', { opacity: 0, translateY: 20 });
    anime.set('.login-card', { opacity: 0, scale: 0.9 });

    // Línea de tiempo: Secuencia de eventos
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 800
    });

    timeline
    .add({
      targets: '.login-card',
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 1000
    })
    .add({
      targets: '.scan-line', // La barrita superior crece
      width: ['0%', '100%'],
      easing: 'easeInOutQuad',
      duration: 500
    }, '-=600') // Empieza 600ms antes de que termine lo anterior
    .add({
      targets: '.stagger-element', // Título, inputs, botón...
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100) // Uno tras otro cada 100ms
    }, '-=400');
  }

    iniciarSesion() {
  if (!this.email || !this.password) {
    this.animacionError();
    return;
  }

  // TRADUCCIÓN PARA DJANGO:
  // Quitamos lo que sobra y renombramos 'email' a 'username'
  const credenciales = {
    username: this.email, // Django espera 'username'
    password: this.password
  };

  this.authService.login(credenciales).subscribe({
    next: (resp) => {
      // SI EL LOGIN ES CORRECTO
      // Ojo: Si el backend devuelve el nombre dentro de 'resp.user.nombre' o similar, asegúrate de pasarlo bien
      this.ejecutarAnimacionSalida(resp.username || 'Usuario');
    },
    error: (err) => {
      console.error(err);
      this.animacionError();
      Swal.fire({
          icon: 'error',
          title: 'ACCESO DENEGADO',
          text: 'Credenciales incorrectas',
          background: '#111',
          color: '#fff'
      });
    }
  });
}

    ejecutarAnimacionSalida(nombreUsuario: string) {
    anime({
      targets: this.loginBtn.nativeElement,
      scale: [1, 0.9],
      duration: 100,
      easing: 'easeInOutQuad',
      complete: () => {
        // Al terminar de encogerse el botón...
        anime({
          targets: '.login-card',
          translateY: -50,
          opacity: 0,
          duration: 400,
          easing: 'easeInExpo',
          complete: () => {
             Swal.fire({
               title: 'ACCESO EXITOSO',
               text: `Bienvenido al sistema, ${nombreUsuario}.`,
               icon: 'success',
               background: '#111',
               color: '#fff',
               confirmButtonColor: '#ff00ff',
               showConfirmButton: false,
               timer: 1500
            }).then(() => {
              // Ya no leemos de 'usuarioGamer'. 
              // Obtenemos los datos desde el token decodificado que tu servicio maneja
              const usuarioDecodificado = this.authService.getUsuarioActual();
              
              // Si el token tiene la propiedad rol (asegúrate de que Python la mande), úsala. 
              // Si no, lo mandamos a una ruta general del dashboard.
              if (usuarioDecodificado && usuarioDecodificado.rol === 'Admin') {
                this.router.navigate(['/dashboard/usuarios']);
              } else {
                this.router.navigate(['/dashboard/inventario']); // Te sugiero mandarlo a inventario o ventas en lugar de la raíz vacía del dashboard
              }
             });
          }
        });
      }
    });
  }
  // Efecto de temblor si te equivocas
  animacionError() {
    anime({
      targets: '.login-card',
      translateX: [
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: 0, duration: 100 }
      ],
      easing: 'linear'
    });
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Datos incompletos',
      background: '#333',
      color: 'white',
      showConfirmButton: false,
      timer: 1500
    });
  }
}