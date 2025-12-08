import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria';
import { Categoria } from '../../interfaces/categoria';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class CategoriasComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  listaCompleta: Categoria[] = [];
  listaVisible: Categoria[] = [];
  
  mostrarModal = false;
  esEdicion = false;
  verPapelera = false; // Control de pestañas

  categoriaForm: any = { id: 0, nombre: '', activo: true };

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.listaCompleta = data;
        this.filtrarLista(); // Aplicar filtro inicial
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }

  // Lógica de Pestañas
  cambiarTab(modoPapelera: boolean) {
    this.verPapelera = modoPapelera;
    this.filtrarLista();
  }

  filtrarLista() {
    this.listaVisible = this.listaCompleta.filter(c => c.activo === !this.verPapelera);
    this.cdr.detectChanges();
  }

  // --- MODAL ---
  abrirModal(categoria?: Categoria) {
    this.mostrarModal = true;
    if (categoria) {
      this.esEdicion = true;
      this.categoriaForm = { ...categoria };
    } else {
      this.esEdicion = false;
      this.categoriaForm = { id: 0, nombre: '', activo: true };
    }
    this.cdr.detectChanges();
  }

  guardarCategoria() {
    if (!this.categoriaForm.nombre.trim()) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Escribe un nombre', background: '#333', color: '#fff' });
      return;
    }

    const request = this.esEdicion
      ? this.categoriaService.actualizarCategoria(this.categoriaForm.id, this.categoriaForm)
      : this.categoriaService.crearCategoria(this.categoriaForm);

    request.subscribe({
      next: () => {
        this.mostrarModal = false;
        this.cargarCategorias();
        Swal.fire({
          title: 'ÉXITO', icon: 'success',
          background: '#111', color: '#fff', timer: 1500, showConfirmButton: false
        });
      },
      error: (e) => Swal.fire({ title: 'Error', text: 'No se pudo guardar', icon: 'error', background: '#111', color: '#fff' })
    });
  }

  // --- ACTIVAR / DESACTIVAR ---
  toggleEstado(cat: Categoria) {
    const esReactivar = !cat.activo;

    Swal.fire({
      title: esReactivar ? '¿REACTIVAR?' : '¿ELIMINAR?',
      text: esReactivar ? `La categoría volverá a estar disponible.` : `Se ocultará la categoría ${cat.nombre}.`,
      icon: esReactivar ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: esReactivar ? 'SÍ, REACTIVAR' : 'SÍ, BORRAR',
      confirmButtonColor: esReactivar ? '#00ffcc' : '#d33',
      cancelButtonText: 'CANCELAR',
      background: '#111', color: '#fff'
    }).then((res) => {
      if (res.isConfirmed) {
        
        const peticion = esReactivar 
            ? this.categoriaService.activarCategoria(cat.id)
            : this.categoriaService.eliminarCategoria(cat.id);

        peticion.subscribe(() => {
          // Actualización optimista: Cambiamos estado y movemos de pestaña
          cat.activo = esReactivar;
          this.filtrarLista(); 
          this.cdr.detectChanges();
          
          Swal.fire({ 
            title: esReactivar ? 'ACTIVADO' : 'ELIMINADO', 
            icon: 'success', background: '#111', color: '#fff', timer: 1000, showConfirmButton: false 
          });
        });
      }
    });
  }
}