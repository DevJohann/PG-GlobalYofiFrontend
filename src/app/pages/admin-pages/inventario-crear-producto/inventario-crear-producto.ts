import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService } from '../../../services/productos';
import { CategoriaService, Categoria } from '../../../services/categoria-service';
import { ProveedorService, Proveedor } from '../../../services/proveedor-service';

@Component({
  selector: 'app-inventario-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventario-crear-producto.html',
  styleUrls: ['./inventario-crear-producto.css']
})
export class InventarioCrearProductoComponent implements OnInit {
  productoForm: FormGroup;
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];
  mensaje: string = '';
  cargando: boolean = false;
  imagenSeleccionada: File | null = null;
  vistaPrevia: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      marca: ['', [Validators.required]],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      estado: ['activo', [Validators.required]],
      categoriaId: [null, [Validators.required]],
      proveedorId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProveedores();
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vistaPrevia = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.mensaje = '⚠️ Por favor completa los campos obligatorios correctamente.';
      return;
    }

    this.cargando = true;
    const formData = new FormData();
    formData.append('producto', new Blob([JSON.stringify(this.productoForm.value)], { type: 'application/json' }));

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    this.productosService.crearProducto(formData).subscribe({
      next: () => {
        this.mensaje = '✅ Producto creado correctamente.';
        setTimeout(() => {
          this.router.navigate(['/admin/reportes-inventario']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error al guardar producto:', err);
        this.mensaje = '❌ Error al guardar el producto.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/reportes-inventario']);
  }
}
