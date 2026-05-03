import { API_CONFIG } from '../config/api.config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface CarritoDTO {
    carritoId: number;
    clienteId: number;
    items: ItemCarritoDTO[];
    totalEstimado: number;
}

export interface ItemCarritoDTO {
    itemId: number;
    productoId: number;
    nombreProducto: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    imagenUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CarritoService {
    private apiUrl = `${API_CONFIG.apiUrl}/carrito`;
    private orderApiUrl = `${API_CONFIG.apiUrl}/pedidos`;
    private clienteApiUrl = `${API_CONFIG.apiUrl}/clientes`;

    // Estado global del carrito
    private cartSubject = new BehaviorSubject<CarritoDTO | null>(null);
    cart$ = this.cartSubject.asObservable();

    constructor(private http: HttpClient) { }

    // Obtener carrito por clienteId
    getCartByClientId(clientId: number): Observable<CarritoDTO> {
        return this.http.get<CarritoDTO>(`${this.apiUrl}/cliente/${clientId}`).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    // Agregar producto al carrito
    agregar(clientId: number, productId: number, quantity: number): Observable<CarritoDTO> {
        return this.http.post<CarritoDTO>(`${this.apiUrl}/agregar-producto`, {
            clienteId: clientId,
            productoId: productId,
            cantidad: quantity
        }).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    // Actualizar cantidad de un item
    actualizarCantidad(itemId: number, quantity: number): Observable<CarritoDTO> {
        return this.http.put<CarritoDTO>(`${this.apiUrl}/item/${itemId}`, {
            cantidad: quantity
        }).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    // Eliminar un item
    eliminar(itemId: number): Observable<CarritoDTO> {
        return this.http.delete<CarritoDTO>(`${this.apiUrl}/item/${itemId}`).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    // Vaciar carrito
    vaciar(cartId: number): Observable<CarritoDTO> {
        return this.http.delete<CarritoDTO>(`${this.apiUrl}/vaciar/${cartId}`).pipe(
            tap(cart => this.cartSubject.next(cart))
        );
    }

    // Resetear estado local (util para logout)
    vaciarEstado(): void {
        this.cartSubject.next(null);
    }

    // Helpers para obtener valores actuales del estado
    get currentCart(): CarritoDTO | null {
        return this.cartSubject.value;
    }

    getTotalItems(): number {
        const cart = this.cartSubject.value;
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.cantidad, 0);
    }

    // Obtener perfil del cliente
    getClienteProfile(clienteId: number): Observable<any> {
        return this.http.get<any>(`${this.clienteApiUrl}/${clienteId}`);
    }

    // Realizar pedido (Checkout)
    realizarPedido(clientId: number, paymentMethod: string, address: string, city: string, docType: string, docNumber: string, obs: string, phone: string): Observable<any> {
        return this.http.post<any>(`${this.orderApiUrl}/realizar`, {
            clienteId: clientId,
            metodoPago: paymentMethod,
            direccion: address,
            ciudad: city,
            tipoDocumento: docType,
            numeroDocumento: docNumber,
            observaciones: obs,
            telefonoPago: phone
        }).pipe(
            tap(() => this.vaciarEstado())
        );
    }
}
