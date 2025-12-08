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
      next: (data) => {
        this.listaUsuarios = data;
        
        this.cdr.detectChanges(); 
      },
      error: (e) => console.error(e)
    });
  }

  guardarUsuario() {
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.cargarUsuarios(); // Recargar tabla
        
        // Limpiar formulario
        this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'Vendedor' };

        Swal.fire({
          title: 'NUEVO EMPLEADO',
          text: 'Usuario creado con éxito',
          icon: 'success',
          background: '#111', color: '#fff'
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'ERROR DE SISTEMA',
          text: err.error || 'No se pudo crear el usuario',
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