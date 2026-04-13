import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface ConfiguracionDTO {
  // QR / transferencia
  nequiNumero?: string;
  nequiNombre?: string;
  qrImageUrl?: string;
  qrTexto?: string;
  qrInfoLabel1?: string;
  qrInfoValue1?: string;
  qrInfoLabel2?: string;
  qrInfoValue2?: string;
  // Condiciones de compra
  condicionesCompra?: string;
  // Precios de envío
  precioEnvioGratis?: number;
  precioEnvio?: number;
  // Contacto
  whatsappNumero?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
  // Tienda
  tiendaDireccion?: string;
  tiendaHorario?: string;
  tiendaTiempoPreparacion?: string;
  // Medios de pago habilitados
  habilitarTransferencia?: boolean;
  habilitarReciboPago?: boolean;
  habilitarRecogerTienda?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = 'http://localhost:8080/api/pagos/config';

  /** Cache de la configuración: se solicita una sola vez por sesión */
  private config$: Observable<ConfiguracionDTO> | null = null;

  constructor(private http: HttpClient) {}

  /** Obtiene la configuración del sistema (cacheada con shareReplay) */
  getConfig(): Observable<ConfiguracionDTO> {
    if (!this.config$) {
      this.config$ = this.http.get<ConfiguracionDTO>(this.apiUrl).pipe(
        shareReplay(1)
      );
    }
    return this.config$;
  }

  /** Guarda la configuración del sistema (requiere rol ADMIN) */
  guardarConfig(config: Partial<ConfiguracionDTO>): Observable<ConfiguracionDTO> {
    this.config$ = null; // Invalidar caché
    return this.http.post<ConfiguracionDTO>(this.apiUrl, config);
  }

  /** Sube el archivo QR (requiere rol ADMIN) */
  subirQr(file: File): Observable<ConfiguracionDTO> {
    this.config$ = null;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ConfiguracionDTO>(`${this.apiUrl}/qr`, formData);
  }
}
