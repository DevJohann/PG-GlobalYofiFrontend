import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../../services/productos';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-productos-crud-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-crud-page.html',
  styleUrls: ['./productos-crud-page.css'],
})
export class ProductosCrudPage implements OnInit, AfterViewInit {

  productos: Producto[] = [];
  mensaje: string = '';
  cargando: boolean = false;

  constructor(
    public productosService: ProductosService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}
  
  irAAgregarProducto(): void {
    this.router.navigate(['/admin/inventario-crear']);
  }

  editar(id: number): void {
    this.router.navigate(['/admin/inventario-editar', id]);
  }
  
  irARetirarStock(): void {
    this.router.navigate(['/admin/inventario-retirar']);
  }

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
    this.cargarProductos();
  }

  // ============================
  // Carga de datos
  // ============================

  cargarProductos(): void {
    this.cargando = true;
    this.productosService.getProductosAdmin().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.mensaje = 'Error al cargar productos';
        this.cargando = false;
      }
    });
  }

  // ============================
  // Carga de datos
  // ============================

  // ============================
  // Eliminar producto
  // ============================

  // ============================
  // Eliminar producto
  // ============================

  async toggleEstado(prod: Producto): Promise<void> {
    const accion = prod.estado?.toUpperCase() === 'ACTIVO' ? 'desactivar' : 'activar';
    const confirmada = await this.notificationService.confirm(`¿Deseas ${accion} este producto?`);
    if (!confirmada) return;

    this.productosService.toggleEstadoProducto(prod.id).subscribe({
      next: () => {
        this.notificationService.success(`✅ Producto ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente`);
        this.cargarProductos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`❌ Error al ${accion} producto:`, err);
        if (err.status === 403) {
          this.notificationService.error(`🚫 No tienes permisos para ${accion} este producto.`);
        } else if (err.status === 401) {
          this.notificationService.error('🔒 Sesión expirada. Inicia sesión nuevamente.');
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          this.notificationService.error(`❌ Error al cambiar el estado del producto.`);
        }
        this.cdr.detectChanges();
      }
    });
  }

}
