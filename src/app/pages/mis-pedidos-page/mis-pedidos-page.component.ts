import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, PedidoAdminDTO } from '../../services/pedido.service';
import { AuthService } from '../../services/auth';
import { SeguimientoPedidoComponent } from '../../components/shared/seguimiento-pedido/seguimiento-pedido.component';
import { NotificationService } from '../../services/notification.service';
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

  // States where cancellation is NOT allowed (order already in transit)
  private readonly ESTADOS_NO_CANCELABLES = ['Enviado', 'En reparto', 'Entregado', 'Cancelado'];

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
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

  // Can only cancel if order is not yet shipped AND payment method is not TRANSFERENCIA
  // (transfers are paid upfront, so they need admin review to cancel)
  canCancelar(pedido: PedidoAdminDTO): boolean {
    const estadoNoPermite = this.ESTADOS_NO_CANCELABLES.some(e =>
      pedido.estado?.toLowerCase() === e.toLowerCase()
    );
    const esTransferencia = pedido.metodoPago?.toUpperCase() === 'TRANSFERENCIA';
    return !estadoNoPermite && !esTransferencia;
  }

  async cancelarPedido(pedido: PedidoAdminDTO): Promise<void> {
    const pedidoId = pedido.id || (pedido as any).idPedido;
    const confirmado = await this.notificationService.confirm(
      `¿Seguro que deseas cancelar el Pedido #${pedidoId}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    this.pedidoService.actualizarEstado(pedidoId, 'Cancelado').subscribe({
      next: () => {
        this.notificationService.success(`✅ Pedido #${pedidoId} cancelado exitosamente.`);
        this.cargarPedidos();
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo cancelar el pedido.';
        this.notificationService.error(`🚨 ${msg}`);
        this.cdr.detectChanges();
      }
    });
  }

  getIconForMetodo(metodo: string): string {
    if (!metodo) return 'account_balance_wallet';
    const m = metodo.toLowerCase();
    if (m.includes('transferencia') || m.includes('nequi')) return 'account_balance_wallet';
    if (m.includes('recibo') || m.includes('efectivo') || m.includes('entrega')) return 'payments';
    if (m.includes('tienda') || m.includes('recoger')) return 'store';
    return 'account_balance_wallet';
  }
}
