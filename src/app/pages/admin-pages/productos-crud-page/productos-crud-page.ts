import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../../services/productos';
import { CategoriaService, Categoria } from '../../../services/categoria-service';
import { ProveedorService, Proveedor } from '../../../services/proveedor-service';

@Component({
  selector: 'app-productos-crud-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-crud-page.html',
  styleUrls: ['./productos-crud-page.css'],
})
export class ProductosCrudPage implements OnInit, AfterViewInit {

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];

  productoSeleccionado: Producto | null = null;
  mensaje: string = '';
  cargando: boolean = false;
  imagenSeleccionada: File | null = null;
  vistaPrevia: string | null = null;

  // ✅ Formulario inicial con stock y estado
  nuevoProducto: any = {
    nombre: '',
    descripcion: '',
    precio: 0,
    marca: '',
    categoriaId: null,
    proveedorId: null,
    stockActual: 0,
    stockMinimo: 0,
    estado: 'activo',
    imagenUrl: ''
  };

  constructor(
    private productosService: ProductosService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    private cdr: ChangeDetectorRef
  ) {}

  // ============================
  // Ciclo de vida
  // ============================

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token, redirigiendo al login...');
      window.location.href = '/login';
      return;
    }
  }

  ngAfterViewInit(): void {
    // 🔄 Cargamos datos solo cuando la vista ya está lista
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarProveedores();
  }

  // ============================
  // Carga de datos
  // ============================

  cargarProductos(): void {
    this.cargando = true;
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.cdr.detectChanges(); // 👈 Forzamos actualización visual inmediata
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.mensaje = 'Error al cargar productos';
        this.cargando = false;
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error al cargar categorías:', err)
    });
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error al cargar proveedores:', err)
    });
  }

  // ============================
  // Manejo de imagen
  // ============================

  onFileSelected(event: any): void {
    this.imagenSeleccionada = event.target.files[0];
    if (this.imagenSeleccionada) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vistaPrevia = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.imagenSeleccionada);
    }
  }

  // ============================
  // Crear o actualizar producto
  // ============================

  guardarProducto(): void {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.precio) {
      this.mensaje = '⚠️ Por favor completa los campos obligatorios';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.mensaje = '⚠️ No estás autenticado.';
      return;
    }

    const formData = new FormData();
    formData.append('producto', new Blob([JSON.stringify(this.nuevoProducto)], { type: 'application/json' }));

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    const accion = this.productoSeleccionado ? 'editado' : 'creado';
    const metodo = this.productoSeleccionado
      ? this.productosService.editarProducto(this.productoSeleccionado.id, formData)
      : this.productosService.crearProducto(formData);

    metodo.subscribe({
      next: () => {
        this.mensaje = `✅ Producto ${accion} correctamente`;
        this.resetFormulario();
        this.cargarProductos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al guardar producto:', err);
        if (err.status === 403) {
          this.mensaje = '🚫 No tienes permisos para realizar esta acción.';
        } else if (err.status === 401) {
          this.mensaje = '🔒 Sesión expirada. Inicia sesión nuevamente.';
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          this.mensaje = '❌ Error al guardar el producto.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  // ============================
  // Editar producto
  // ============================

  editar(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.vistaPrevia = producto.imagenUrl ? `http://localhost:8080/${producto.imagenUrl}` : null;

    this.nuevoProducto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      marca: producto.marca,
      categoriaId: this.categorias.find(c => c.nombre === producto.categoria)?.id || null,
      proveedorId: this.proveedores.find(p => p.nombre === producto.proveedor)?.id || null,
      stockActual: (producto as any).stockActual || 0,
      stockMinimo: (producto as any).stockMinimo || 0,
      estado: (producto as any).estado || 'activo',
      imagenUrl: producto.imagenUrl
    };

    this.cdr.detectChanges();
  }

  // ============================
  // Eliminar producto
  // ============================

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    this.productosService.eliminarProducto(id).subscribe({
      next: () => {
        this.mensaje = '🗑️ Producto eliminado correctamente';
        this.cargarProductos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al eliminar producto:', err);
        if (err.status === 403) {
          this.mensaje = '🚫 No tienes permisos para eliminar este producto.';
        } else if (err.status === 401) {
          this.mensaje = '🔒 Sesión expirada. Inicia sesión nuevamente.';
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          this.mensaje = '❌ Error al eliminar el producto.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  // ============================
  // Reset formulario
  // ============================

  resetFormulario(): void {
    this.nuevoProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      marca: '',
      categoriaId: null,
      proveedorId: null,
      stockActual: 0,
      stockMinimo: 0,
      estado: 'activo',
      imagenUrl: ''
    };
    this.imagenSeleccionada = null;
    this.vistaPrevia = null;
    this.productoSeleccionado = null;
    this.cdr.detectChanges();
  }
}
