import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface Cliente {
  id?: number;
  idCliente?: number; // Variante backend
  nombre?: string;
  apellido?: string; // Nuevo: Para evitar duplicidad
  email?: string;
  telefono?: string;
  direccion: string;
  ciudad: string;
  identificacion?: string;
  numeroDocumento?: string; // Variante backend
  estado?: string;
  activo?: boolean; // Variante backend
  fechaRegistro?: string;
  // Soporte para objeto usuario anidado
  usuario?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    activo?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = 'http://localhost:8080/api/clientes';
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

  /** 🧾 Obtener todos los clientes */
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  /** 🆔 Obtener un cliente por ID */
  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /** 💾 Crear un nuevo cliente */
  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente, { headers: this.getAuthHeaders() });
  }

  /** ✏️ Editar cliente existente */
  actualizarCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente, { headers: this.getAuthHeaders() });
  }

  /** 🗑️ Eliminar cliente */
  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
