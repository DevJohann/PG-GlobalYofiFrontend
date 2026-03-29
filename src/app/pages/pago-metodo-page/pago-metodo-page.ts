import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-pago-metodo-page',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './pago-metodo-page.html',
    styleUrls: ['./pago-metodo-page.css']
})
export class PagoMetodoPageComponent implements OnInit {
    metodoSeleccionado: string | null = null;
    isLoggedIn = false;
    userEmail: string | null = null;
    carrito: any = null;
    
    // Información de envío y facturación
    direccion: string = '';
    ciudad: string = '';
    tipoDocumento: string = '';
    numeroDocumento: string = '';
    observaciones: string = '';

    // Character limits for fields
    readonly MAX_CHARS = 50;

    tiposDocumento = [
        { id: 'CC', nombre: 'Cédula de Ciudadanía' },
        { id: 'CE', nombre: 'Cédula de Extranjería' },
        { id: 'TI', nombre: 'Tarjeta de Identidad' },
        { id: 'NIT', nombre: 'NIT (Empresas)' },
        { id: 'PASAPORTE', nombre: 'Pasaporte' }
    ];

    metodos = [
        { id: 'RECIBO_PAGO', nombre: 'Pago al recibir', descripcion: 'Paga en efectivo cuando recibas tu pedido en la puerta de tu casa.', icono: '🏠' },
        { id: 'TRANSFERENCIA', nombre: 'Transferencia / Nequi', descripcion: 'Realiza una transferencia a nuestra cuenta y envíanos el comprobante.', icono: '🏦' },
        { id: 'RECOGER_TIENDA', nombre: 'Recoger en Tienda', descripcion: 'Ven por tu pedido directamente a nuestro local físico. No se requiere dirección de envío.', icono: '🛍️' }
    ];

    // Whether address fields should be shown (hidden for store pickup)
    get mostrarDireccion(): boolean {
        return this.metodoSeleccionado !== 'RECOGER_TIENDA';
    }

    constructor(
        private carritoService: CarritoService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.checkLoginStatus();
        this.carritoService.cart$.subscribe(cart => {
            this.carrito = cart;
            if (!cart || cart.items.length === 0) {
                this.router.navigate(['/carrito']);
            }
            this.cdr.detectChanges();
        });
    }

    checkLoginStatus(): void {
        this.isLoggedIn = this.authService.isLoggedIn();
        if (this.isLoggedIn) {
            const user = this.authService.getUser();
            this.userEmail = user ? user.email : null;
            
            const userId = user?.id || user?.clienteId;
            if (userId) {
                this.carritoService.getClienteProfile(userId).subscribe({
                    next: (profile) => {
                        if (profile.direccion) this.direccion = profile.direccion;
                        if (profile.ciudad) this.ciudad = profile.ciudad;
                        if (profile.tipoDocumento) this.tipoDocumento = profile.tipoDocumento;
                        if (profile.numeroDocumento) this.numeroDocumento = profile.numeroDocumento;
                        this.cdr.detectChanges();
                    }
                });
            }
        } else {
            this.router.navigate(['/login']);
        }
        this.cdr.detectChanges();
    }

    seleccionarMetodo(id: string): void {
        this.metodoSeleccionado = id;
        this.cdr.detectChanges();
    }

    // Enforce max character length on model changes
    limitarCampo(field: 'direccion' | 'ciudad' | 'numeroDocumento' | 'observaciones'): void {
        if (this[field] && this[field].length > this.MAX_CHARS) {
            (this as any)[field] = this[field].substring(0, this.MAX_CHARS);
        }
    }

    async finalizarPedido(): Promise<void> {
        if (!this.metodoSeleccionado) {
            this.notificationService.info('Por favor selecciona un método de pago.');
            return;
        }

        // Validate required document fields (always required)
        if (!this.tipoDocumento || !this.numeroDocumento) {
            this.notificationService.error('⚠️ Por favor diligencia tu tipo y número de documento para continuar.');
            return;
        }

        // Validate address fields only when NOT store pickup
        if (this.mostrarDireccion) {
            const camposFaltantes: string[] = [];
            if (!this.ciudad.trim()) camposFaltantes.push('Ciudad');
            if (!this.direccion.trim()) camposFaltantes.push('Dirección');

            if (camposFaltantes.length > 0) {
                this.notificationService.error(`⚠️ Por favor completa los siguientes campos: ${camposFaltantes.join(', ')}.`);
                return;
            }
        }

        const user = this.authService.getUser();
        const userId = user?.id || user?.clienteId;

        if (userId) {
            // For store pickup, send empty address/city so backend knows
            const direccionFinal = this.mostrarDireccion ? this.direccion : 'RECOGER_TIENDA';
            const ciudadFinal = this.mostrarDireccion ? this.ciudad : 'TIENDA';

            this.carritoService.realizarPedido(
                userId, 
                this.metodoSeleccionado, 
                direccionFinal, 
                ciudadFinal,
                this.tipoDocumento,
                this.numeroDocumento,
                this.observaciones
            ).subscribe({
                next: (res: any) => {
                    const pedidoId = res?.id || res?.idPedido;
                    this.router.navigate(['/confirmacion-pago', pedidoId]);
                },
                error: (err: any) => {
                    console.error('Error al realizar pedido', err);
                    const msg = err.error?.message || 'Hubo un error al procesar tu pedido. Por favor intenta de nuevo.';
                    this.notificationService.error(msg);
                }
            });
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
