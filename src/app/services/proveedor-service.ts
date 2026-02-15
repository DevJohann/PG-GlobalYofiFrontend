import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proveedor {
  id: number;
  nombre: string;
  contactoPrincipal: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  nit: string;
  estado: string;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly apiUrl = 'http://localhost:8080/api/proveedores';

  constructor(private http: HttpClient) {}

  /** 🧾 Obtener todos los proveedores */
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }
}