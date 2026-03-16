import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth';

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
    
    // Información de envío
    direccion: string = '';
    ciudad: string = '';

    metodos = [
        { id: 'RECIBO_PAGO', nombre: 'Pago al recibir', descripcion: 'Paga en efectivo cuando recibas tu pedido en la puerta de tu casa.', icono: '🏠' },
        { id: 'TRANSFERENCIA', nombre: 'Transferencia Bancaria', descripcion: 'Realiza una transferencia a nuestra cuenta y envíanos el comprobante.', icono: '🏦' },
        { id: 'RECOGER_TIENDA', nombre: 'Recoger en Tienda', descripcion: 'Ven por tu pedido directamente a nuestro local físico.', icono: '🛍️' }
    ];

    constructor(
        private carritoService: CarritoService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
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

    finalizarPedido(): void {
        if (!this.metodoSeleccionado) {
            alert('Por favor selecciona un método de pago.');
            return;
        }

        const user = this.authService.getUser();
        const userId = user?.id || user?.clienteId;

        if (userId) {
            this.carritoService.realizarPedido(userId, this.metodoSeleccionado, this.direccion, this.ciudad).subscribe({
                next: (res: any) => {
                    alert('✨ ¡Pedido realizado con éxito! Gracias por confiar en Global Yofi.');
                    this.router.navigate(['/productos']);
                },
                error: (err: any) => {
                    console.error('Error al realizar pedido', err);
                    const msg = err.error?.message || 'Hubo un error al procesar tu pedido. Por favor intenta de nuevo.';
                    alert(msg);
                }
            });
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
