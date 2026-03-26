import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CarritoService, CarritoDTO, ItemCarritoDTO } from '../../services/carrito.service';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification.service';

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
    private destroy$ = new Subject<void>();

    constructor(
        public carritoService: CarritoService,
        public productosService: ProductosService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.checkLoginStatus();
        // Suscribirse al estado global del carrito
        this.carritoService.cart$
            .pipe(takeUntil(this.destroy$))
            .subscribe(cart => {
                this.carrito = cart;
                if (this.carrito && this.carrito.items.length > 0) {
                    this.enriquecerCarritoConImagenes();
                }
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

    async vaciarCarrito(): Promise<void> {
        if (this.carrito) {
            const confirmada = await this.notificationService.confirm('¿Estás seguro de que deseas vaciar tu carrito? Esta acción eliminará todos los productos.');
            if (confirmada) {
                this.carritoService.vaciar(this.carrito.carritoId).subscribe({
                    next: () => this.notificationService.success('Carrito vaciado con éxito.'),
                    error: () => this.notificationService.error('No se pudo vaciar el carrito.')
                });
            }
        }
    }

    procederAlPago(): void {
        if (!this.carrito || this.carrito.items.length === 0) return;
        this.router.navigate(['/pago-metodo']);
    }

    private enriquecerCarritoConImagenes(): void {
        if (!this.carrito) return;

        const observables = this.carrito.items.map(item => {
            // Si ya tiene imagen, no hacemos nada (por si acaso el backend la envía)
            if (item.imagenUrl) return of(null);

            return this.productosService.getProductoById(item.productoId).pipe(
                catchError(() => of(null)) // Ignorar errores de un producto específico
            );
        });

        forkJoin(observables).subscribe(productos => {
            if (!this.carrito) return;

            productos.forEach((producto, index) => {
                if (producto && this.carrito) {
                    this.carrito.items[index].imagenUrl = producto.imagenUrl;
                }
            });
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
