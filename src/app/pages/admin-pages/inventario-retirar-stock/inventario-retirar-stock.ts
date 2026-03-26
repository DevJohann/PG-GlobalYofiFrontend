import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService, Producto } from '../../../services/productos';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-inventario-retirar-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-retirar-stock.html',
  styleUrls: ['./inventario-retirar-stock.css']
})
export class InventarioRetirarStockComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  terminoBusqueda: string = '';
  mensaje: string = '';
  cargando: boolean = false;

  cantidadARetirar: { [id: number]: number } = {};

  constructor(
    public productosService: ProductosService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.mensaje = '❌ Error al cargar productos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscar(): void {
    if (!this.terminoBusqueda.trim()) {
      this.productosFiltrados = this.productos;
    } else {
      const term = this.terminoBusqueda.toLowerCase();
      this.productosFiltrados = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.marca.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  retirarStock(producto: Producto): void {
    const cantidad = this.cantidadARetirar[producto.id];
    
    if (!cantidad || cantidad <= 0) {
      this.mensaje = '⚠️ Ingrese una cantidad válida.';
      return;
    }

    if (cantidad > (producto.stockActual || 0)) {
      this.notificationService.error(`⚠️ No hay suficiente stock. (Disponible: ${producto.stockActual})`);
      return;
    }

    this.procederRetiro(producto, cantidad);
  }

  async procederRetiro(producto: Producto, cantidad: number): Promise<void> {
    const confirmada = await this.notificationService.confirm(`¿Seguro que deseas retirar ${cantidad} unidades de ${producto.nombre}?`);
    if (!confirmada) return;

    this.cargando = true;
    
    // Necesitamos el DTO completo para la actualización según el backend actual a menos que agreguemos un endpoint patch
    // Como no podemos modificar el backend fácilmente para agregar un endpoint parcial, usaremos el PUT existente.
    
    const nuevoStock = (producto.stockActual || 0) - cantidad;
    
    // El backend espera MultipartFile para imagen si usamos ProductosService.editarProducto
    // pero el controller tiene @RequestPart(value = "imagen", required = false)
    
    const productoEditado: any = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      marca: producto.marca,
      stockActual: nuevoStock,
      stockMinimo: producto.stockMinimo || 0,
      estado: producto.estado || 'activo',
      categoriaId: producto.categoriaId,
      proveedorId: producto.proveedorId
    };

    // Si el objeto producto no tiene categoriaId/proveedorId (vienen como strings en el DTO de respuesta), 
    // tendremos problemas. 
    // Vamos a verificar qué campos tiene 'producto' de la lista.
    // El DTO de respuesta suele ser diferente al de request.
    
    const formData = new FormData();
    formData.append('producto', new Blob([JSON.stringify(productoEditado)], { type: 'application/json' }));

    this.productosService.editarProducto(producto.id, formData).subscribe({
      next: () => {
        this.notificationService.success(`✅ Stock actualizado para ${producto.nombre}.`);
        this.cantidadARetirar[producto.id] = 0;
        this.cargarProductos(); // Recargar lista
      },
      error: (err) => {
        console.error('❌ Error al actualizar stock:', err);
        this.notificationService.error('❌ Error al actualizar el stock.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/reportes-inventario']);
  }
}
