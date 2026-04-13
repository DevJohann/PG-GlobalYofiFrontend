import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification.service';
import { ConfiguracionService, ConfiguracionDTO } from '../../../services/configuracion.service';

@Component({
  selector: 'app-config-pagos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-pagos-page.component.html',
  styleUrls: ['./config-pagos-page.component.css']
})
export class ConfigPagosPageComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/pagos/config';

  // Model for the configuration
  config: ConfiguracionDTO = {
    nequiNumero: '',
    nequiNombre: '',
    qrTexto: 'Transferencia',
    qrInfoLabel1: '',
    qrInfoValue1: '',
    qrInfoLabel2: '',
    qrInfoValue2: '',
    condicionesCompra: '',
    precioEnvioGratis: 150000,
    precioEnvio: 15000,
    whatsappNumero: '',
    contactoTelefono: '',
    contactoEmail: '',
    tiendaDireccion: '',
    tiendaHorario: '',
    tiendaTiempoPreparacion: '',
    habilitarTransferencia: true,
    habilitarReciboPago: true,
    habilitarRecogerTienda: true
  };

  qrPreviewUrl: string | null = null;
  qrArchivoSeleccionado: File | null = null;

  guardando = false;
  subiendoQr = false;
  cargando = true;

  constructor(
    private configService: ConfiguracionService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConfig();
  }

  cargarConfig(): void {
    this.cargando = true;
    this.configService.getConfig().subscribe({
      next: (config) => {
        this.config = { ...this.config, ...config };
        if (config.qrImageUrl) {
          this.qrPreviewUrl = 'http://localhost:8080' + config.qrImageUrl;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarConfig(): void {
    this.guardando = true;
    this.configService.guardarConfig(this.config).subscribe({
      next: (res) => {
        this.guardando = false;
        this.config = { ...this.config, ...res };
        this.notificationService.success('✅ Configuración global guardada exitosamente.');
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
    this.configService.subirQr(this.qrArchivoSeleccionado).subscribe({
      next: (res) => {
        this.subiendoQr = false;
        this.qrPreviewUrl = 'http://localhost:8080' + (res.qrImageUrl || '');
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
