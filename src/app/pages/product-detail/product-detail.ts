import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito.service';
import { NotificationService } from '../../services/notification.service';
import { ConfiguracionService, ConfiguracionDTO } from '../../services/configuracion.service';

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
    config: ConfiguracionDTO | null = null;

    constructor(
        private route: ActivatedRoute,
        public productosService: ProductosService,
        private authService: AuthService,
        public carritoService: CarritoService,
        private configService: ConfiguracionService,
        private cdr: ChangeDetectorRef,
        private notificationService: NotificationService,
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
        this.cargarConfiguracion();
    }

    cargarConfiguracion(): void {
        this.configService.getConfig().subscribe({
            next: (config) => {
                this.config = config;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al cargar config global en detalle', err)
        });
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
        this.carritoService.vaciarEstado();
        this.isLoggedIn = false;
        this.userEmail = null;
    }

    cambiarCantidad(delta: number): void {
        const nuevaCantidad = this.cantidad + delta;
        const maxStock = this.producto?.stockActual !== undefined ? this.producto.stockActual : 99;

        if (nuevaCantidad >= 1 && nuevaCantidad <= maxStock) {
            this.cantidad = nuevaCantidad;
        } else if (nuevaCantidad > maxStock) {
            this.notificationService.info(`Lo sentimos, solo hay ${maxStock} unidades disponibles en stock.`);
        }
    }

    agregarAlCarrito(): void {
        const user = this.authService.getUser();
        // Intentamos detectar el ID de forma flexible
        let userId = user?.id || user?.clienteId || user?.usuarioId || user?.idUsuario;
        
        // Fallback: buscar cualquier propiedad que termine en ID
        if (!userId && user) {
            for (const key in user) {
                if (key.toLowerCase().endsWith('id') && typeof user[key] === 'number') {
                    userId = user[key];
                    break;
                }
            }
        }

        console.log('DEBUG [Cart]: User session detected:', user, 'Resolved ID:', userId);
        
        if (!this.isLoggedIn || !userId) {
            this.notificationService.error('Debes iniciar sesión para añadir productos al carrito.');
            return;
        }

        if (!this.producto) return;

        this.carritoService.agregar(userId, this.producto.id, this.cantidad).subscribe({
            next: (cart) => {
                this.notificationService.success('✨ ¡Producto añadido al carrito correctamente!');
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al añadir al carrito:', err);
                this.notificationService.error('No se pudo añadir el producto al carrito. Por favor intenta de nuevo.');
            }
        });
    }
}

