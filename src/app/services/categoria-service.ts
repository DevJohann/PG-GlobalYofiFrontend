import { API_CONFIG } from '../config/api.config';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
  fechaCreacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly apiUrl = `${API_CONFIG.apiUrl}/categorias`;
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

  /** 📚 Obtener categorías activas (Público) */
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  /** 🛡️ Obtener todas las categorías (Admin - incluye inactivas) */
  getCategoriasAdmin(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/admin`, { headers: this.getAuthHeaders() });
  }

  /** 🆔 Obtener una categoría por ID */
  getCategoriaById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  /** 💾 Crear una nueva categoría */
  crearCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria, { headers: this.getAuthHeaders() });
  }

  /** ✏️ Editar categoría existente */
  actualizarCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria, { headers: this.getAuthHeaders() });
  }

  /** 🗑️ Eliminar categoría */
  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /** 🔄 Activar/Desactivar categoría */
  toggleCategoriaEstado(id: number): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.apiUrl}/${id}/toggle`, {}, { headers: this.getAuthHeaders() });
  }
}