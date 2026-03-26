import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService, Categoria } from '../../../services/categoria-service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-categorias-crud-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-crud-page.html',
  styleUrls: ['./categorias-crud-page.css']
})
export class CategoriasCrudPage implements OnInit {
  categorias: Categoria[] = [];
  cargando = false;
  
  // Modal y Formulario
  mostrarModal = false;
  modoEdicion = false;
  categoriaForm: Categoria = this.initForm();

  constructor(
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  initForm(): Categoria {
    return {
      nombre: '',
      descripcion: '',
      activa: true
    };
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(): void {
    this.modoEdicion = false;
    this.categoriaForm = this.initForm();
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  editarCategoria(cat: Categoria): void {
    this.modoEdicion = true;
    this.categoriaForm = { ...cat };
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  guardarCategoria(event: Event): void {
    event.preventDefault();
    if (!this.categoriaForm.nombre) return;

    if (this.modoEdicion && this.categoriaForm.id) {
      this.categoriaService.actualizarCategoria(this.categoriaForm.id, this.categoriaForm).subscribe({
        next: () => {
          this.notificationService.success('✅ Categoría actualizada con éxito');
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (err) => {
          console.error('Error al actualizar', err);
          this.notificationService.error('No se pudo actualizar la categoría.');
        }
      });
    } else {
      this.categoriaService.crearCategoria(this.categoriaForm).subscribe({
        next: () => {
          this.notificationService.success('✅ Categoría creada con éxito');
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (err) => {
          console.error('Error al crear', err);
          this.notificationService.error('No se pudo crear la categoría.');
        }
      });
    }
  }

  async eliminarCategoria(id: number): Promise<void> {
    const confirmada = await this.notificationService.confirm('¿Estás seguro de que deseas eliminar esta categoría?');
    if (confirmada) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: () => {
          this.notificationService.success('🗑️ Categoría eliminada');
          this.cargarCategorias();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.notificationService.error('🚨 No se pudo eliminar la categoría. Verifique si tiene productos asociados.');
        }
      });
    }
  }
}
