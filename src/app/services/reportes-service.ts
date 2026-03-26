// ✅ src/app/services/reportes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly baseUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient, private notificationService: NotificationService) {}

  // =====================================================
  // 🔐 Encabezado con token + manejo de sesión seguro
  // =====================================================
  private getAuthHeaders(): HttpHeaders {
    // ⚙️ Verificamos que estamos en el navegador
    if (typeof window === 'undefined') {
      console.warn('⚠️ getAuthHeaders() llamado fuera del navegador');
      return new HttpHeaders();
    }

    try {
      const token = localStorage?.getItem('token');
      console.log('🔑 Token leído del localStorage:', token);

      if (!token) {
        this.notificationService.error('⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
        return new HttpHeaders();
      }

      // ✅ Devolvemos encabezado con el token
      return new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    } catch (err) {
      console.error('🚨 Error al acceder al localStorage:', err);
      return new HttpHeaders();
    }
  }

  // =====================================================
  // 🧴 REPORTES DE PRODUCTOS
  // =====================================================

  getProductosPorCategoria(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/productos-por-categoria`,
      { headers: this.getAuthHeaders() }
    );
  }

  getStockPorProveedor(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/stock-por-proveedor`,
      { headers: this.getAuthHeaders() }
    );
  }

  getTopProductosPorPrecio(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/productos-top-precio`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =====================================================
  // 💸 REPORTES DE VENTAS
  // =====================================================

  getVentasPorMes(): Observable<{ totalVentas: number; mes: number; anio: number }[]> {
    return this.http.get<{ totalVentas: number; mes: number; anio: number }[]>(
      `${this.baseUrl}/ventas-por-mes`,
      { headers: this.getAuthHeaders() }
    );
  }

  getVentasPorCiudad(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/ventas-por-ciudad`,
      { headers: this.getAuthHeaders() }
    );
  }

  getRentabilidadPorProveedor(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/rentabilidad-por-proveedor`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =====================================================
  // 👥 REPORTES DE CLIENTES
  // =====================================================

  getClientesFrecuentes(): Observable<{ cliente: string; totalPedidos: number }[]> {
    return this.http.get<{ cliente: string; totalPedidos: number }[]>(
      `${this.baseUrl}/clientes-frecuentes`,
      { headers: this.getAuthHeaders() }
    );
  }

  getPedidosPorEstado(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/pedidos-por-estado`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =====================================================
  // 📦 REPORTES DE INVENTARIO
  // =====================================================

  getRotacionInventario(): Observable<{ producto: string; entradas: number; salidas: number }[]> {
    return this.http.get<{ producto: string; entradas: number; salidas: number }[]>(
      `${this.baseUrl}/rotacion-inventario`,
      { headers: this.getAuthHeaders() }
    );
  }

  getHistorialInventario(): Observable<{ producto: string; cantidad: number; tipoMovimiento: string; fecha: string; usuario: string }[]> {
    return this.http.get<{ producto: string; cantidad: number; tipoMovimiento: string; fecha: string; usuario: string }[]>(
      `${this.baseUrl}/historial-inventario`,
      { headers: this.getAuthHeaders() }
    );
  }

  getProductosBajoStock(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/productos-bajo-stock`,
      { headers: this.getAuthHeaders() }
    );
  }

  getClientesTotal(): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/clientes-total`,
      { headers: this.getAuthHeaders() }
    );
  }
}
