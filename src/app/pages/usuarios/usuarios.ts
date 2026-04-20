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
  
  esEdicion = false;
  idEdicion = 0;

  abrirModalNuevo() {
    this.esEdicion = false;
    this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'Vendedor' };
    this.mostrarModal = true;
  }

  editarUsuario(u: any) {
    this.esEdicion = true;
    this.idEdicion = u.id;
    this.nuevoUsuario = {
      nombre: u.nombre,
      email: u.email,
      password: '', // Lo dejamos vacío por seguridad
      rol: u.rol
    };
    this.mostrarModal = true;
  }
  
  nuevoUsuario: UsuarioRegistro = {
    nombre: '',
    email: '',
    password: '',
    rol: 'Vendedor'
  };

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data: any[]) => {
        this.listaUsuarios = data.map(u => ({
          id: u.id,
          nombre: u.username,
          email: u.email,
          rol: u.rol,
          activo: u.is_active
        }));
        
        this.cdr.detectChanges(); 
      },
      error: (e) => console.error(e)
    });
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email) {
      this.lanzarAlerta('Datos Incompletos', 'El nombre y correo son obligatorios', 'warning');
      return;
    }

    // Traducimos los campos al idioma que entiende Django
    const paqueteParaDjango: any = {
      username: this.nuevoUsuario.nombre, // Django validará que no tenga números ahora
      email: this.nuevoUsuario.email,
      rol: this.nuevoUsuario.rol // Asegúrate que en el HTML el select tenga value="Admin"
    };

    if (this.nuevoUsuario.password && this.nuevoUsuario.password.trim() !== '') {
      paqueteParaDjango.password = this.nuevoUsuario.password;
    }

    const request = this.esEdicion
      ? this.usuarioService.actualizarUsuario(this.idEdicion, paqueteParaDjango)
      : this.usuarioService.crearUsuario(paqueteParaDjango);

    request.subscribe({
      next: () => {
        this.mostrarModal = false;
        this.cargarUsuarios(); 
        this.lanzarAlerta('¡ÉXITO!', 'Operación realizada correctamente', 'success');
      },
      error: (err) => {
        // Extraemos el mensaje limpio (como lo arreglamos antes)
        let msj = 'Error al procesar usuario';
        if (err.error && typeof err.error === 'object') {
           const keys = Object.keys(err.error);
           if (keys.length > 0) {
             const primerError = err.error[keys[0]];
             msj = Array.isArray(primerError) ? primerError[0] : primerError;
           }
        }
        this.lanzarAlerta('ERROR DE VALIDACIÓN', String(msj), 'error');
      }
    });
  }

  // Función auxiliar para no repetir el código del Z-Index
  lanzarAlerta(titulo: string, texto: string, icono: any) {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      background: '#111',
      color: '#fff',
      confirmButtonColor: '#ff00ff',
      didOpen: () => {
        const container = document.querySelector('.swal2-container') as HTMLElement;
        if (container) container.style.zIndex = '999999';
      }
    });
  }

  cambiarEstado(user: UsuarioResponse) {
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
            this.cdr.detectChanges(); 
            Swal.fire({ title: 'USUARIO DESACTIVADO', icon: 'success', background: '#111', color: '#fff' });
          });
        }
      });
    } else {
      this.usuarioService.activarUsuario(user.id).subscribe({
        next: () => {
          user.activo = true; 
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