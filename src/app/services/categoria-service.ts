import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly apiUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  /** 📚 Obtener todas las categorías */
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
}