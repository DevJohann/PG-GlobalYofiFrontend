import { API_CONFIG } from '../config/api.config';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface Proveedor {
  id?: number;
  nombre: string;
  contactoPrincipal: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  nit: string;
  estado: string;
  fechaRegistro?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly apiUrl = `${API_CONFIG.apiUrl}/proveedores`;
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

  /** 🧾 Obtener proveedores activos (Público) */
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  /** 🛡️ Obtener TODOS los proveedores (Admin - incluye inactivos) */
  getProveedoresAdmin(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/admin`, { headers: this.getAuthHeaders() });
  }

  /** 🆔 Obtener un proveedor por ID */
  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  /** 💾 Crear un nuevo proveedor */
  crearProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor, { headers: this.getAuthHeaders() });
  }

  /** ✏️ Editar proveedor existente */
  actualizarProveedor(id: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor, { headers: this.getAuthHeaders() });
  }

  /** 🗑️ Eliminar proveedor */
  eliminarProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /** 🔄 Alternar estado activo/inactivo del proveedor */
  toggleEstadoProveedor(id: number): Observable<Proveedor> {
    return this.http.patch<Proveedor>(`${this.apiUrl}/${id}/toggle`, {}, { headers: this.getAuthHeaders() });
  }
}