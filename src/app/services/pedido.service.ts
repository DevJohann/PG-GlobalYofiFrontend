import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PedidoAdminDTO {
  id: number;
  nombreCliente: string;
  emailCliente: string;
  fecha: string;
  total: number;
  metodoPago: string;
  estado: string;
  direccion: string;
  ciudad: string;
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
  private apiUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) { }

  // Obtener todos los pedidos (Vista Admin)
  getAllPedidos(): Observable<PedidoAdminDTO[]> {
    return this.http.get<PedidoAdminDTO[]>(this.apiUrl);
  }

  // Obtener detalle de un pedido
  getPedidoById(id: number): Observable<PedidoAdminDTO> {
    return this.http.get<PedidoAdminDTO>(`${this.apiUrl}/${id}`);
  }

  // Actualizar estado del pedido (Ej: PENDIENTE -> ENVIADO)
  actualizarEstado(id: number, nuevoEstado: string): Observable<PedidoAdminDTO> {
    return this.http.put<PedidoAdminDTO>(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }
}
