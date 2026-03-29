import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-config-pagos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-pagos-page.component.html',
  styleUrls: ['./config-pagos-page.component.css']
})
export class ConfigPagosPageComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/pagos/config';

  // Config fields
  nequiNumero: string = '';
  nequiNombre: string = '';
  qrPreviewUrl: string | null = null;
  qrArchivoSeleccionado: File | null = null;

  guardando = false;
  subiendoQr = false;
  cargando = true;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConfig();
  }

  cargarConfig(): void {
    this.cargando = true;
    this.http.get<any>(this.apiUrl).subscribe({
      next: (config) => {
        this.nequiNumero = config.nequiNumero || '';
        this.nequiNombre = config.nequiNombre || '';
        this.qrPreviewUrl = config.qrImageUrl || null;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Config might not exist yet — that's fine
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarConfig(): void {
    this.guardando = true;
    const payload = {
      nequiNumero: this.nequiNumero,
      nequiNombre: this.nequiNombre
    };
    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (res) => {
        this.guardando = false;
        this.notificationService.success('✅ Configuración de pago guardada exitosamente.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        const msg = err.error?.message || 'Error al guardar la configuración.';
        this.notificationService.error(`🚨 ${msg}`);
        this.cdr.detectChanges();
      }
    });
  }

  onQrSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.qrArchivoSeleccionado = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.qrPreviewUrl = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.qrArchivoSeleccionado);
    }
  }

  subirQr(): void {
    if (!this.qrArchivoSeleccionado) return;
    this.subiendoQr = true;
    const formData = new FormData();
    formData.append('file', this.qrArchivoSeleccionado);
    this.http.post<any>(`${this.apiUrl}/qr`, formData).subscribe({
      next: (res) => {
        this.subiendoQr = false;
        this.qrPreviewUrl = res.qrImageUrl;
        this.qrArchivoSeleccionado = null;
        this.notificationService.success('✅ QR cargado exitosamente. Los clientes ya pueden verlo.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.subiendoQr = false;
        const msg = err.error?.message || 'Error al subir el QR.';
        this.notificationService.error(`🚨 ${msg}`);
        this.cdr.detectChanges();
      }
    });
  }
}
