import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JuegoService } from '../../services/juego'; // Asegúrate de la extensión .service
import { CategoriaService } from '../../services/categoria';
import { Videojuego } from '../../interfaces/videojuego';
import { Categoria } from '../../interfaces/categoria';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class InventarioComponent implements OnInit {
  private juegoService = inject(JuegoService);
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  listaCompleta: Videojuego[] = []; 
  listaVisible: Videojuego[] = [];  
  listaCategorias: Categoria[] = [];
  
  busquedaId: string = '';
  mostrarModal = false;
  esEdicion = false;
  verPapelera = false;

  juegoForm: any = {
    id: 0,
    titulo: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    url_imagen: '',
    fechaLanzamiento: new Date().toISOString().split('T')[0],
    categoriaId: 0
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.juegoService.getVideojuegos().subscribe((data: any[]) => {
      
      // TRADUCTOR COMPLETO: Mapeamos TODOS los campos explícitamente para que TypeScript no llore
      this.listaCompleta = data.map(j => ({
        id: j.id,
        titulo: j.titulo,
        descripcion: j.descripcion,
        precio: j.precio,
        stock: j.stock,
        activo: j.activo, 
        categoriaId: j.categoria, 
        categoriaNombre: j.categoria_nombre,
        fechaLanzamiento: j.fecha_lanzamiento || j.fechaLanzamiento,
        
        // ¡LA IMAGEN SE LLAMA IGUAL EN AMBOS LADOS!
        url_imagen: j.url_imagen 
      }));
      
      this.filtrarLista(); 
      this.cdr.detectChanges();
    });

    this.categoriaService.getCategorias().subscribe(data => {
      this.listaCategorias = data.filter(c => c.activo);
      this.cdr.detectChanges();
    });
  }

  cambiarTab(modoPapelera: boolean) {
    this.verPapelera = modoPapelera;
    this.busquedaId = ''; // Limpiamos búsqueda al cambiar pestaña
    this.filtrarLista();
  }

  filtrarLista() {
    // Filtramos la lista completa basándonos en la pestaña activa
    this.listaVisible = this.listaCompleta.filter(j => j.activo === !this.verPapelera);
    this.cdr.detectChanges();
  }

  // --- BUSCAR POR ID (API) ---
  buscarPorId() {
    if (!this.busquedaId) {
      this.cargarDatos(); 
      return;
    }

    const id = Number(this.busquedaId);
    this.juegoService.getJuego(id).subscribe({
      next: (juego) => {
        // Mostramos directamente el juego encontrado en la tabla visible
        this.listaVisible = [juego]; 
        
        // Opcional: Si quieres que respete la pestaña, puedes validar si juego.activo coincide con !verPapelera
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Juego no encontrado', background: '#111', color: '#fff', timer: 2000 });
        this.listaVisible = []; // Tabla vacía si no encuentra nada
        this.cdr.detectChanges();
      }
    });
  }

  // --- ABRIR MODAL ---
  abrirModal(juego?: Videojuego) {
    this.mostrarModal = true;
    
    if (juego) {
      this.esEdicion = true;
      this.juegoForm = { 
        ...juego,
        fechaLanzamiento: String(juego.fechaLanzamiento).split('T')[0] 
      }; 
    } else {
      this.esEdicion = false;
      this.juegoForm = {
        id: 0, titulo: '', descripcion: '', precio: 0, stock: 0, 
        url_imagen: '', fechaLanzamiento: new Date().toISOString().split('T')[0], 
        categoriaId: this.listaCategorias[0]?.id || 0
      };
    }
    this.cdr.detectChanges();
  }

  guardarJuego() {
    if (!this.juegoForm.titulo || this.juegoForm.precio <= 0) {
      Swal.fire({ title: 'Datos incompletos', text: 'Revisa el título y el precio', icon: 'warning', background: '#111', color: '#fff' });
      return;
    }

    // CREAMOS EL PAQUETE "TRADUCIDO" PARA DJANGO
    const paqueteParaDjango = {
      titulo: this.juegoForm.titulo,
      descripcion: this.juegoForm.descripcion,
      precio: this.juegoForm.precio,
      stock: this.juegoForm.stock,
      url_imagen: this.juegoForm.url_imagen, 
      
      fecha_lanzamiento: this.juegoForm.fechaLanzamiento,
      categoria: Number(this.juegoForm.categoriaId),
      activo: true
    };

    const request = this.esEdicion
      ? this.juegoService.actualizarJuego(this.juegoForm.id, paqueteParaDjango)
      : this.juegoService.crearJuego(paqueteParaDjango);

    request.subscribe({
      next: () => {
        Swal.fire({
          title: this.esEdicion ? 'ACTUALIZADO' : 'CREADO',
          icon: 'success',
          background: '#111', color: '#fff', timer: 1500, showConfirmButton: false
        });
        this.mostrarModal = false;
        this.cargarDatos(); 
      },
      error: (e) => {
        console.error(e);
        Swal.fire({ title: 'Error', text: 'No se pudo guardar en la base de datos', icon: 'error', background: '#111', color: '#fff' });
      }
    });
  }

  // --- TOGGLE ESTADO ---
  toggleEstado(juego: Videojuego) {
    const esReactivar = !juego.activo;

    Swal.fire({
      title: esReactivar ? '¿REACTIVAR JUEGO?' : '¿ELIMINAR DEL CATÁLOGO?',
      text: esReactivar ? `Volverá a estar visible.` : `Se ocultará ${juego.titulo}.`,
      icon: esReactivar ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: esReactivar ? 'SÍ, REACTIVAR' : 'SÍ, BORRAR',
      confirmButtonColor: esReactivar ? '#00ffcc' : '#d33',
      cancelButtonText: 'CANCELAR',
      background: '#111', color: '#fff'
    }).then((res) => {
      if (res.isConfirmed) {
        
        const peticion = esReactivar 
            ? this.juegoService.activarJuego(juego.id)
            : this.juegoService.eliminarJuego(juego.id);

        peticion.subscribe(() => {
          // Actualización optimista: Cambiamos el estado y re-filtramos
          // Esto hará que el juego "salte" a la otra pestaña automáticamente
          juego.activo = esReactivar;
          this.filtrarLista(); 
          
          Swal.fire({ 
            title: esReactivar ? 'JUEGO ACTIVO' : 'JUEGO ELIMINADO', 
            icon: 'success', 
            background: '#111', color: '#fff', timer: 1000, showConfirmButton: false 
          });
        });
      }
    });
  }
}