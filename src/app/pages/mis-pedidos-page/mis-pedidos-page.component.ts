import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, PedidoAdminDTO } from '../../services/pedido.service';
import { AuthService } from '../../services/auth';
import { SeguimientoPedidoComponent } from '../../components/shared/seguimiento-pedido/seguimiento-pedido.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-pedidos-page',
  standalone: true,
  imports: [CommonModule, SeguimientoPedidoComponent, RouterLink],
  templateUrl: './mis-pedidos-page.component.html',
  styleUrls: ['./mis-pedidos-page.component.css']
})
export class MisPedidosPageComponent implements OnInit {
  pedidos: PedidoAdminDTO[] = [];
  loading = true;
  error = '';

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Escuchar al usuario para cargar pedidos en cuanto esté disponible
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.cargarPedidos();
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarPedidos(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.pedidoService.getMisPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
        this.error = 'No se pudieron cargar tus pedidos. Por favor, intenta más tarde.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getIconForMetodo(metodo: string): string {
    if (metodo.toLowerCase().includes('card') || metodo.toLowerCase().includes('tarjeta')) return 'credit_card';
    if (metodo.toLowerCase().includes('cash') || metodo.toLowerCase().includes('efectivo')) return 'payments';
    return 'account_balance_wallet';
  }
}
