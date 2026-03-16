import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarritoService, CarritoDTO, ItemCarritoDTO } from '../../services/carrito.service';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-carrito-page',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './carrito-page.html',
    styleUrls: ['./carrito-page.css']
})
export class CarritoPageComponent implements OnInit {
    carrito: CarritoDTO | null = null;
    isLoggedIn = false;
    userEmail: string | null = null;

    constructor(
        public carritoService: CarritoService,
        public productosService: ProductosService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.checkLoginStatus();
        // Suscribirse al estado global del carrito
        this.carritoService.cart$.subscribe(cart => {
            this.carrito = cart;
            this.cdr.detectChanges();
        });

        // Cargar el carrito si no está presente
        const user = this.authService.getUser();
        const userId = user?.id || user?.clienteId;
        
        if (userId && !this.carrito) {
            this.carritoService.getCartByClientId(userId).subscribe();
        }
    }

    checkLoginStatus(): void {
        this.isLoggedIn = this.authService.isLoggedIn();
        if (this.isLoggedIn) {
            const user = this.authService.getUser();
            this.userEmail = user ? user.email : null;
        }
        this.cdr.detectChanges();
    }

    logout(): void {
        this.authService.logout();
        this.carritoService.vaciarEstado();
        this.isLoggedIn = false;
        this.userEmail = null;
        this.cdr.detectChanges();
    }

    cambiarCantidad(item: ItemCarritoDTO, delta: number): void {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0) {
            this.carritoService.actualizarCantidad(item.itemId, nuevaCantidad).subscribe();
        }
    }

    eliminar(item: ItemCarritoDTO): void {
        this.carritoService.eliminar(item.itemId).subscribe();
    }

    vaciarCarrito(): void {
        if (this.carrito && confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
            this.carritoService.vaciar(this.carrito.carritoId).subscribe();
        }
    }

    procederAlPago(): void {
        if (!this.carrito || this.carrito.items.length === 0) return;
        this.router.navigate(['/pago-metodo']);
    }
}
