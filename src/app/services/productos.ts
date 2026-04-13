import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
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
  categoriaId: number;
  proveedorId: number;
  stockActual?: number;
  stockMinimo?: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly apiUrl = 'http://localhost:8080/api/productos';
  private readonly baseUrl = 'http://localhost:8080';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /** 🖼️ Obtener la URL completa de la imagen */
  getImagenUrl(path: string | null | undefined): string {
    if (!path || path.trim() === '') {
      return 'assets/img/yofi/MascotaGlobalYofi.png'; 
    }

    // Si la ruta ya es completa (http/https), la retornamos
    if (path.startsWith('http')) {
      return path;
    }

    // Normalizar el path: asegurar que empiece con /uploads/ si viene del backend
    // Si viene como /img/ se cambia a /uploads/ (asumiendo patrón del backend)
    let normalizedPath = path.startsWith('/img/') 
      ? path.replace('/img/', '/uploads/') 
      : path;

    if (!normalizedPath.startsWith('/uploads/') && !normalizedPath.startsWith('assets/')) {
       normalizedPath = '/uploads/' + (normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath);
    }

    // Si es un asset local, no le ponemos el baseUrl
    if (normalizedPath.startsWith('assets/')) {
      return normalizedPath;
    }

    return `${this.baseUrl}${normalizedPath}`;
  }

  // ==============================================================
  // 🔹 MÉTODOS PÚBLICOS (no requieren autenticación)
  // ==============================================================

  /** 📦 Obtener todos los productos (solo activos para público) */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  /** 🛡️ Obtener TODOS los productos (incluidos inactivos - solo ADMIN) */
  getProductosAdmin(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/admin`);
  }

  /** 🆔 Obtener un producto por su ID */
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
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

  /** 🧩 Obtener productos por filtros combinados (categorías, precio, búsqueda) */
  getFilterProductos(categoriaIds: number[] | null, min: number | null, max: number | null, search: string | null, sortBy: string | null, estado: string | null = null): Observable<Producto[]> {
    let params = new HttpParams();
    
    if (categoriaIds && categoriaIds.length > 0) {
      params = params.set('categoriaIds', categoriaIds.join(','));
    }
    if (min !== null) params = params.set('minPrecio', min.toString());
    if (max !== null) params = params.set('maxPrecio', max.toString());
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (estado) params = params.set('estado', estado);

    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  // ==============================================================
  // 🔐 MÉTODOS PROTEGIDOS (requieren token)
  // ==============================================================

  /** 🪪 Obtener encabezados con token */
  private getAuthHeaders(): HttpHeaders {
    const token = this.isBrowser ? localStorage.getItem('token') : null;

    if (!token) {
      return new HttpHeaders();
    }

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
