import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface PedidoAdminDTO {
  id: number;
  idPedido?: number; // Algunos endpoints podrían usar este nombre
  pedidoId?: number; // Otros podrían usar este
  nombreCliente: string;
  emailCliente: string;
  fecha: string;
  total: number;
  metodoPago: string;
  estado: string;
  direccion: string;
  ciudad: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  telefonoPago?: string;
  observaciones?: string;
  items: LineaPedidoDTO[];
}

export interface LineaPedidoDTO {
  id: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  // private apiUrl = 'http://localhost:8080/api/pedidos';
  private apiUrl = 'http://pg-globalyofibackend.railway.internal/api/pedidos';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Obtener todos los pedidos (Vista Admin)
  getAllPedidos(): Observable<PedidoAdminDTO[]> {
    return this.http.get<PedidoAdminDTO[]>(this.apiUrl);
  }

  // Obtener detalle de un pedido
  getPedidoById(id: number): Observable<PedidoAdminDTO> {
    return this.http.get<PedidoAdminDTO>(`${this.apiUrl}/${id}`);
  }

  // Obtener pedidos del cliente autenticado
  getMisPedidos(): Observable<PedidoAdminDTO[]> {
    return this.http.get<PedidoAdminDTO[]>(`${this.apiUrl}/mis-pedidos`);
  }

  // Actualizar estado del pedido (Ej: PENDIENTE -> ENVIADO)
  actualizarEstado(id: number, nuevoEstado: string): Observable<PedidoAdminDTO> {
    return this.http.put<PedidoAdminDTO>(
      `${this.apiUrl}/${id}/estado`, 
      { estado: nuevoEstado }
    );
  }
}
