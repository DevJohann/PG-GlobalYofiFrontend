import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagoDTO {
  idPago: number;
  pedidoId: number;
  metodo: string;
  estado: string;
  referencia: string;
  comprobanteUrl: string | null;
  fecha: string;
  totalPedido: number;
  estadoPedido: string;
  nombreCliente: string;
  emailCliente: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  // private apiUrl = 'http://localhost:8080/api/pagos';
  private apiUrl = 'http://pg-globalyofibackend.railway.internal/api/pagos';

  constructor(private http: HttpClient) {}

  iniciarPago(pedidoId: number): Observable<PagoDTO> {
    return this.http.post<PagoDTO>(`${this.apiUrl}/${pedidoId}/iniciar`, {});
  }

  obtenerPago(pedidoId: number): Observable<PagoDTO> {
    return this.http.get<PagoDTO>(`${this.apiUrl}/${pedidoId}`);
  }

  subirComprobante(pedidoId: number, file: File): Observable<PagoDTO> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PagoDTO>(`${this.apiUrl}/${pedidoId}/comprobante`, formData);
  }

  validarPago(pedidoId: number): Observable<PagoDTO> {
    return this.http.patch<PagoDTO>(`${this.apiUrl}/${pedidoId}/validar`, {});
  }

  getConfiguracion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/config`);
  }
}
