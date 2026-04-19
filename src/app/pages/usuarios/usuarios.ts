import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario';
import { UsuarioResponse, UsuarioRegistro } from '../../interfaces/usuario';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  listaUsuarios: UsuarioResponse[] = [];
  mostrarModal = false;
  // 1. AGREGA ESTAS VARIABLES ARRIBA (Debajo de mostrarModal)
  esEdicion = false;
  idEdicion = 0;

  // 2. CAMBIA ESTO PARA ABRIR EL MODAL LIMPIO
  abrirModalNuevo() {
    this.esEdicion = false;
    this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'Vendedor' };
    this.mostrarModal = true;
  }

  // 3. NUEVA FUNCIÓN PARA ABRIR EL MODAL CON DATOS
  editarUsuario(u: any) {
    this.esEdicion = true;
    this.idEdicion = u.id;
    this.nuevoUsuario = {
      nombre: u.nombre,
      email: u.email,
      password: '', // Lo dejamos vacío por seguridad, para no mostrar la encriptada
      rol: u.rol
    };
    this.mostrarModal = true;
  }
  // Objeto para el formulario de nuevo usuario
  nuevoUsuario: UsuarioRegistro = {
    nombre: '',
    email: '',
    password: '',
    rol: 'Vendedor' // Por defecto
  };

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data: any[]) => {
        // TRADUCTOR: De Django (snake_case) a Angular
        this.listaUsuarios = data.map(u => ({
          id: u.id,
          nombre: u.username,  // <--- Django manda 'username'
          email: u.email,
          rol: u.rol,
          activo: u.is_active  // <--- Django manda 'is_active'
        }));
        
        this.cdr.detectChanges(); 
      },
      error: (e) => console.error(e)
    });
  }

  guardarUsuario() {
    // 1. Validamos que no nos dejen campos vacíos por error
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email) {
      Swal.fire({ 
        title: 'Datos Incompletos', 
        text: 'El nombre y el correo son obligatorios.', 
        icon: 'warning', 
        background: '#111', color: '#fff' 
      });
      return;
    }

    // 2. Empaquetamos los datos traduciéndolos para Django
    const paqueteParaDjango: any = {
      username: this.nuevoUsuario.nombre, // Django exige que se llame 'username'
      email: this.nuevoUsuario.email,
      rol: this.nuevoUsuario.rol
    };

    // 3. LA MAGIA DE LA CONTRASEÑA:
    // Si escribieron una contraseña, la mandamos al backend para que la encripte.
    // Si la dejaron en blanco, NO la mandamos, así Django respeta la que ya existía.
    if (this.nuevoUsuario.password && this.nuevoUsuario.password.trim() !== '') {
      paqueteParaDjango.password = this.nuevoUsuario.password;
    }

    // 4. Decidimos qué ruta tomar: ¿Estamos editando o creando?
    const request = this.esEdicion
      ? this.usuarioService.actualizarUsuario(this.idEdicion, paqueteParaDjango)
      : this.usuarioService.crearUsuario(paqueteParaDjango);

    // 5. Enviamos la petición al servidor
    request.subscribe({
      next: () => {
        // Todo salió bien: Cerramos modal, recargamos tabla y lanzamos alerta verde
        this.mostrarModal = false;
        this.cargarUsuarios(); 
        
        Swal.fire({
          title: this.esEdicion ? '¡USUARIO ACTUALIZADO!' : '¡NUEVO EMPLEADO!',
          text: this.esEdicion ? 'Datos modificados correctamente' : 'Usuario creado con éxito',
          icon: 'success',
          background: '#111', color: '#fff'
        });
      },
      error: (err) => {
        // Hubo un error: Leemos qué le duele a Django y lo mostramos en rojo
        let msj = 'No se pudo guardar el usuario';
        if (err.error && typeof err.error === 'object') {
           msj = JSON.stringify(err.error);
        } else if (typeof err.error === 'string') {
           msj = err.error;
        }
        
        Swal.fire({ 
          title: 'ERROR EN BACKEND', 
          text: msj, 
          icon: 'error', 
          background: '#111', color: '#fff' 
        });
      }
    });
  }

cambiarEstado(user: UsuarioResponse) {
    // Si está activo lo desactivamos
    if (user.activo) { 
      
      Swal.fire({
        title: '¿DESACTIVAR USUARIO?',
        text: `Se desactivará el acceso a ${user.nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'CONFIRMAR',
        cancelButtonText: 'CANCELAR',
        confirmButtonColor: '#d33',
        background: '#111', color: '#fff'
      }).then((result) => {
        if (result.isConfirmed) {
          this.usuarioService.desactivarUsuario(user.id).subscribe(() => {
            
            user.activo = false; 
            this.cdr.detectChanges(); // Forzamos el cambio visual INMEDIATO

            Swal.fire({ title: 'USUARIO DESACTIVADO', icon: 'success', background: '#111', color: '#fff' });
          });
        }
      });

    } else {
      // LOGICA DE ACTIVAR
      this.usuarioService.activarUsuario(user.id).subscribe({
        next: () => {

          user.activo = true; 
          
          // Forzamos el repintado inmediato
          this.cdr.detectChanges(); 
          
          const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            background: '#111', color: '#fff'
          });
          Toast.fire({ icon: 'success', title: 'Usuario Reactivado' });
        },
        error: (e) => {
           console.error('Error al activar:', e);
           Swal.fire({ title: 'Error', text: 'No se pudo activar', icon: 'error' });
        }
      });
    }
  }
}