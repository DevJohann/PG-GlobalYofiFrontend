import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, PedidoAdminDTO } from '../../../services/pedido.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedidos-crud-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-crud-page.html',
  styleUrls: ['./pedidos-crud-page.css']
})
export class PedidosCrudPage implements OnInit {
  pedidos: PedidoAdminDTO[] = [];
  pedidoSeleccionado: PedidoAdminDTO | null = null;
  cargando = false;
  cargandoDetalle = false;

  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    this.pedidoService.getAllPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalles(pedido: PedidoAdminDTO): void {
    const id = this.extraerId(pedido);
    if (!id) {
      console.error('No se pudo encontrar un ID válido en el objeto pedido', pedido);
      return;
    }
    
    this.cargandoDetalle = true;
    this.cdr.detectChanges();
    this.pedidoService.getPedidoById(id).subscribe({
      next: (fullPedido) => {
        this.pedidoSeleccionado = fullPedido;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar detalles del pedido', err);
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarDetalles(): void {
    this.pedidoSeleccionado = null;
    this.cdr.detectChanges();
  }

  cambiarEstado(pedidoId: number, nuevoEstado: string): void {
    console.log(`DEBUG [Pedido]: Intentando cambiar estado del pedido ${pedidoId} a ${nuevoEstado}`);
    this.pedidoService.actualizarEstado(pedidoId, nuevoEstado).subscribe({
      next: (pedidoActualizado) => {
        console.log('DEBUG [Pedido]: Estado actualizado con éxito', pedidoActualizado);
        alert(`✅ El estado del pedido #${pedidoId} ha sido actualizado a ${nuevoEstado}`);
        this.cargarPedidos();
        if (this.pedidoSeleccionado && this.extraerId(this.pedidoSeleccionado) === pedidoId) {
          this.pedidoSeleccionado.estado = nuevoEstado;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('DEBUG [Pedido]: Error al cambiar estado', err);
        const errorMsg = err.error?.message || 'Hubo un problema al conectar con el servidor.';
        alert(`🚨 Error: No se pudo actualizar el estado. ${errorMsg}`);
        this.cdr.detectChanges();
      }
    });
  }

  extraerId(pedido: PedidoAdminDTO): number {
    return pedido.id || pedido.idPedido || pedido.pedidoId || 0;
  }
}
