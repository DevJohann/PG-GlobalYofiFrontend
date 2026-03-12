import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-detail.html',
    styleUrls: ['./product-detail.css']
})
export class ProductDetail implements OnInit {
    producto: Producto | null = null;
    cargando = true;
    error = '';
    isLoggedIn = false;
    userEmail: string | null = null;
    cantidad: number = 1;
    private isBrowser: boolean;

    constructor(
        private route: ActivatedRoute,
        public productosService: ProductosService,
        private authService: AuthService,
        public carritoService: CarritoService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.cargarProducto(+id);
        }
        this.checkLoginStatus();
    }

    cargarProducto(id: number): void {
        this.productosService.getProductoById(id).subscribe({
            next: (data) => {
                this.producto = data;
                this.cargando = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al cargar el producto:', err);
                this.error = 'No se pudo cargar la información del producto.';
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
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
        this.isLoggedIn = false;
        this.userEmail = null;
    }

    cambiarCantidad(delta: number): void {
        const nuevaCantidad = this.cantidad + delta;
        const maxStock = this.producto?.stockActual !== undefined ? this.producto.stockActual : 99;

        if (nuevaCantidad >= 1 && nuevaCantidad <= maxStock) {
            this.cantidad = nuevaCantidad;
        } else if (nuevaCantidad > maxStock) {
            alert(`Solo hay ${maxStock} unidades disponibles en stock.`);
        }
    }

    agregarAlCarrito(): void {
        if (!this.producto) return;

        const resultado = this.carritoService.agregar(this.producto, this.cantidad);
        if (resultado.success) {
            alert(resultado.message);
        } else {
            alert(resultado.message);
        }
    }
}
