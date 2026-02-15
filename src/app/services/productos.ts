import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  marca: string;
  imagenUrl: string;
  categoria: string;
  proveedor: string;
  stockActual?: number;
  stockMinimo?: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  // ==============================================================
  // 🔹 MÉTODOS PÚBLICOS (no requieren autenticación)
  // ==============================================================

  /** 📦 Obtener todos los productos */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  /** 🔍 Obtener productos por categoría */
  getByCategoria(id: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${id}`);
  }

  /** 💰 Obtener productos por rango de precio */
  getByPrecio(min: number, max: number): Observable<Producto[]> {
    const params = new HttpParams()
      .set('min', min)
      .set('max', max);
    return this.http.get<Producto[]>(`${this.apiUrl}/precio`, { params });
  }

  /** 🧩 Obtener productos por categoría y precio */
  getByCategoriaYPrecio(categoriaId: number, min: number, max: number): Observable<Producto[]> {
    const params = new HttpParams()
      .set('categoriaId', categoriaId)
      .set('minPrecio', min)
      .set('maxPrecio', max);
    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  // ==============================================================
  // 🔐 MÉTODOS PROTEGIDOS (requieren token)
  // ==============================================================

  /** 🪪 Obtener encabezados con token */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage?.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ==============================================================
  // 💾 CRUD de productos con soporte de imagen
  // ==============================================================

  /** 💾 Crear un nuevo producto (con imagen opcional) */
  crearProducto(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, formData, {
      headers: this.getAuthHeaders().delete('Content-Type')
    });
  }

  /** ✏️ Editar producto existente (con imagen opcional) */
  editarProducto(id: number, formData: FormData): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, formData, {
      headers: this.getAuthHeaders().delete('Content-Type')
    });
  }

  /** 🗑️ Eliminar producto por ID */
  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
