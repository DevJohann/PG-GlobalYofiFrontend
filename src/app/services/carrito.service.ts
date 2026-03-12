import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from './productos';

export interface CartItem {
    producto: Producto;
    cantidad: number;
}

@Injectable({
    providedIn: 'root'
})
export class CarritoService {
    private items: CartItem[] = [];
    private itemsSubject = new BehaviorSubject<CartItem[]>([]);
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.cargarCarrito();
    }

    // Cargar estado inicial del carrito desde localStorage
    private cargarCarrito(): void {
        if (this.isBrowser) {
            const stored = localStorage.getItem('carritoYofi');
            if (stored) {
                try {
                    this.items = JSON.parse(stored);
                    this.itemsSubject.next([...this.items]);
                } catch (e) {
                    console.error('Error parseando carrito', e);
                }
            }
        }
    }

    // Guardar estado en localStorage
    private guardarCarrito(): void {
        if (this.isBrowser) {
            localStorage.setItem('carritoYofi', JSON.stringify(this.items));
        }
        this.itemsSubject.next([...this.items]);
    }

    // Observable para suscribirse a los cambios
    getCarrito(): Observable<CartItem[]> {
        return this.itemsSubject.asObservable();
    }

    // Obtener items actuales de forma síncrona
    getItems(): CartItem[] {
        return this.items;
    }

    // Agregar al carrito verificando stock
    agregar(producto: Producto, cantidad: number): { success: boolean, message: string } {
        if (cantidad <= 0) return { success: false, message: 'La cantidad debe ser mayor a 0.' };

        const maxStock = producto.stockActual !== undefined ? producto.stockActual : 99;

        const indice = this.items.findIndex(item => item.producto.id === producto.id);

        if (indice > -1) {
            // Ya existe en carrito
            const nuevaCantidad = this.items[indice].cantidad + cantidad;
            if (nuevaCantidad > maxStock) {
                return { success: false, message: `No puedes agregar esa cantidad. Solo hay ${maxStock} en stock (tienes ${this.items[indice].cantidad} en tu carrito).` };
            }
            this.items[indice].cantidad = nuevaCantidad;
        } else {
            // Nuevo producto
            if (cantidad > maxStock) {
                return { success: false, message: `No hay suficiente stock. Disponible: ${maxStock}.` };
            }
            this.items.push({ producto, cantidad });
        }

        this.guardarCarrito();
        return { success: true, message: 'Producto añadido correctamente al carrito.' };
    }

    // Actualizar cantidad específica
    actualizarCantidad(productoId: number, nuevaCantidad: number): void {
        const indice = this.items.findIndex(item => item.producto.id === productoId);
        if (indice > -1) {
            if (nuevaCantidad <= 0) {
                this.eliminar(productoId);
            } else {
                const p = this.items[indice].producto;
                const maxStock = p.stockActual !== undefined ? p.stockActual : 99;
                this.items[indice].cantidad = Math.min(nuevaCantidad, maxStock);
                this.guardarCarrito();
            }
        }
    }

    // Eliminar producto
    eliminar(productoId: number): void {
        this.items = this.items.filter(item => item.producto.id !== productoId);
        this.guardarCarrito();
    }

    // Vaciar carrito
    vaciar(): void {
        this.items = [];
        this.guardarCarrito();
    }

    // Total de items para badges en la navbar
    getTotalItems(): number {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }

    // Total precio a pagar
    getTotalPrecio(): number {
        return this.items.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
    }
}
