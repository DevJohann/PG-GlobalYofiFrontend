import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seguimiento-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-pedido.component.html',
  styleUrls: ['./seguimiento-pedido.component.css']
})
export class SeguimientoPedidoComponent {
  @Input() estado: string = '';

  estados = [
    { key: 'Pendiente de envío', label: 'Pendiente', icon: 'pending_actions' },
    { key: 'Preparando envío', label: 'Preparando', icon: 'inventory_2' },
    { key: 'Enviado', label: 'Enviado', icon: 'local_shipping' },
    { key: 'En reparto', label: 'En reparto', icon: 'delivery_dining' },
    { key: 'Entregado', label: 'Entregado', icon: 'check_circle' }
  ];

  isCompleted(index: number): boolean {
    const currentIndex = this.estados.findIndex(e => e.key === this.estado);
    return index <= currentIndex;
  }

  isCurrent(index: number): boolean {
    return this.estados.findIndex(e => e.key === this.estado) === index;
  }
}
