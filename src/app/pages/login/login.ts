import { Component, ElementRef, ViewChild, AfterViewInit, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Para navegar tras el login
import Swal from 'sweetalert2'; //para las alertas
import { AuthService } from '../../services/auth';

// 👇 Importante: Declaramos la variable global
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
    // LÓGICA CON EL BACKEND
    const credenciales = {
      nombre: "LoginUser", // Relleno
      email: this.email,
      password: this.password,
      rol: "Admin"         // Relleno
    };
    this.authService.login(credenciales).subscribe({
      next: (usuario) => {
        // SI EL LOGIN ES CORRECTO -> EJECUTAMOS LA ANIMACIÓN DE SALIDA
        this.ejecutarAnimacionSalida(usuario.nombre);
      },
      error: (err) => {
        // SI FALLA -> ANIMACIÓN DE ERROR
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
             const usuario = JSON.parse(localStorage.getItem('usuarioGamer') || '{}');
   
             if (usuario.rol === 'Admin') {
             this.router.navigate(['/dashboard/usuarios']);
            } else {
              this.router.navigate(['/dashboard']); // O a ventas cuando lo crees
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