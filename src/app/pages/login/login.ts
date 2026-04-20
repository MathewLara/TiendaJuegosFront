import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import Swal from 'sweetalert2'; 
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
    anime.set('.stagger-element', { opacity: 0, translateY: 20 });
    anime.set('.login-card', { opacity: 0, scale: 0.9 });

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
      targets: '.scan-line', 
      width: ['0%', '100%'],
      easing: 'easeInOutQuad',
      duration: 500
    }, '-=600') 
    .add({
      targets: '.stagger-element', 
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100) 
    }, '-=400');
  }

  iniciarSesion() {
    // CASO 1: Campos vacíos
    if (!this.email || !this.password) {
      this.efectoTemblor(); // Solo tiembla
      Swal.fire({           // Muestra el error de campos
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Datos incompletos',
        background: '#333',
        color: 'white',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    const credenciales = {
      username: this.email, 
      password: this.password
    };

    // CASO 2: Envío al Backend
    this.authService.login(credenciales).subscribe({
      next: (resp) => {
        this.ejecutarAnimacionSalida(resp.username || 'Usuario');
      },
      error: (err) => {
        console.error(err);
        this.efectoTemblor(); // Solo tiembla
        Swal.fire({           // Muestra el error de acceso denegado
            icon: 'error',
            title: 'ACCESO DENEGADO',
            text: 'Credenciales incorrectas',
            background: '#111',
            color: '#fff',
            confirmButtonColor: '#ff00ff'
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
              const usuarioDecodificado = this.authService.getUsuarioActual();
              
              if (usuarioDecodificado && usuarioDecodificado.rol === 'Admin') {
                this.router.navigate(['/dashboard/usuarios']);
              } else {
                this.router.navigate(['/dashboard/inventario']); 
              }
             });
          }
        });
      }
    });
  }

  // NUEVO: Efecto de temblor PURO (sin SweetAlert) para evitar conflictos
  efectoTemblor() {
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
  }
}