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
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private getAuthHeaders(): HttpHeaders {
    if (!this.isBrowser) return new HttpHeaders();
    
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los pedidos (Vista Admin)
  getAllPedidos(): Observable<PedidoAdminDTO[]> {
    return this.http.get<PedidoAdminDTO[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Obtener detalle de un pedido
  getPedidoById(id: number): Observable<PedidoAdminDTO> {
    return this.http.get<PedidoAdminDTO>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Actualizar estado del pedido (Ej: PENDIENTE -> ENVIADO)
  actualizarEstado(id: number, nuevoEstado: string): Observable<PedidoAdminDTO> {
    return this.http.put<PedidoAdminDTO>(
      `${this.apiUrl}/${id}/estado`, 
      { estado: nuevoEstado },
      { headers: this.getAuthHeaders() }
    );
  }
}
