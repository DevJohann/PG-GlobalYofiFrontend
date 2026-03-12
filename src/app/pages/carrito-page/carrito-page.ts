import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService, CartItem } from '../../services/carrito.service';
import { ProductosService } from '../../services/productos';

@Component({
    selector: 'app-carrito-page',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './carrito-page.html',
    styleUrls: ['./carrito-page.css']
})
export class CarritoPageComponent implements OnInit {
    items: CartItem[] = [];
    total: number = 0;

    constructor(
        public carritoService: CarritoService,
        public productosService: ProductosService
    ) { }

    ngOnInit(): void {
        // Suscribirse a los cambios del carrito para mantener la UI actualizada
        this.carritoService.getCarrito().subscribe(items => {
            this.items = items;
            this.total = this.carritoService.getTotalPrecio();
        });
    }

    cambiarCantidad(item: CartItem, delta: number): void {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0) {
            this.carritoService.actualizarCantidad(item.producto.id, nuevaCantidad);
        }
    }

    eliminar(item: CartItem): void {
        this.carritoService.eliminar(item.producto.id);
    }

    vaciarCarrito(): void {
        if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
            this.carritoService.vaciar();
        }
    }

    procederAlPago(): void {
        if (this.items.length === 0) return;
        alert('🛍️ Redirigiendo a la pasarela de pago... (Funcionalidad próximamente)');
    }
}
