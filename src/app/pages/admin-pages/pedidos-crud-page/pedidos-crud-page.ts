import { Component, OnInit } from '@angular/core';
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

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.pedidoService.getAllPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.cargando = false;
      }
    });
  }

  verDetalles(pedido: PedidoAdminDTO): void {
    this.pedidoSeleccionado = pedido;
  }

  cerrarDetalles(): void {
    this.pedidoSeleccionado = null;
  }

  cambiarEstado(pedidoId: number, nuevoEstado: string): void {
    this.pedidoService.actualizarEstado(pedidoId, nuevoEstado).subscribe({
      next: () => {
        this.cargarPedidos();
        if (this.pedidoSeleccionado && this.pedidoSeleccionado.id === pedidoId) {
          this.pedidoSeleccionado.estado = nuevoEstado;
        }
      },
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }
}
