import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PagoService, PagoDTO } from '../../services/pago.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-confirmacion-pago',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './confirmacion-pago.component.html',
  styleUrls: ['./confirmacion-pago.component.css']
})
export class ConfirmacionPagoComponent implements OnInit {
  pedidoId: number | null = null;
  pago: PagoDTO | null = null;
  loading = true;
  error = '';

  // Comprobante upload
  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;
  subiendo = false;
  comprobanteEnviado = false;

  // Dynamic store/payment config
  nequiNumero = 'Cargando...';
  nequiNombre = 'Cargando...';
  qrImageUrl = '/assets/qr-nequi.png';

  readonly tiendaDireccion = 'Calle 6 # 2-26, Gama, Cundinamarca';
  readonly tiendaHorario = 'Lunes a Sábado: 8am – 6pm';
  readonly tiendaTiempoPreparacion = '1-2 días hábiles';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();

    this.route.paramMap.subscribe(params => {
      const id = params.get('pedidoId');
      if (id) {
        this.pedidoId = +id;
        this.cargarPago();
      } else {
        this.router.navigate(['/mis-pedidos']);
      }
    });
  }

  cargarConfiguracion(): void {
    this.pagoService.getConfiguracion().subscribe({
      next: (config) => {
        if (config.nequiNumero) this.nequiNumero = config.nequiNumero;
        if (config.nequiNombre) this.nequiNombre = config.nequiNombre;
        if (config.qrImageUrl) {
          this.qrImageUrl = 'http://localhost:8080' + config.qrImageUrl;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar config de Nequi', err)
    });
  }

  cargarPago(): void {
    if (!this.pedidoId) return;
    this.loading = true;
    this.pagoService.obtenerPago(this.pedidoId).subscribe({
      next: (data) => {
        this.pago = data;
        this.loading = false;
        this.comprobanteEnviado = data.estado === 'VERIFICACION' || data.estado === 'VALIDADO';
        this.cdr.detectChanges();
      },
      error: (err) => {
        // If pago doesn't exist yet, try to initiate it
        if (err.status === 404 || err.status === 500) {
          this.iniciarPago();
        } else {
          this.error = 'No se pudo cargar la información del pago.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  iniciarPago(): void {
    if (!this.pedidoId) return;
    this.pagoService.iniciarPago(this.pedidoId).subscribe({
      next: (data) => {
        this.pago = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al inicializar el pago. Por favor contáctanos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoSeleccionado = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.archivoSeleccionado);
    }
  }

  subirComprobante(): void {
    if (!this.archivoSeleccionado || !this.pedidoId) return;
    this.subiendo = true;
    this.pagoService.subirComprobante(this.pedidoId, this.archivoSeleccionado).subscribe({
      next: (data) => {
        this.pago = data;
        this.comprobanteEnviado = true;
        this.subiendo = false;
        this.notificationService.success('✅ Comprobante enviado. En espera de verificación.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.subiendo = false;
        this.notificationService.error('Error al subir el comprobante. Intenta de nuevo.');
        this.cdr.detectChanges();
      }
    });
  }

  abrirWhatsApp(): void {
    const numero = '573101234567'; // configurable
    const msg = encodeURIComponent(`Hola! Acabo de realizar el pedido ${this.pago?.referencia} y quiero confirmar el pago.`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  }

  get esTransferencia(): boolean {
    return this.pago?.metodo === 'TRANSFERENCIA';
  }

  get esContraEntrega(): boolean {
    return this.pago?.metodo === 'RECIBO_PAGO';
  }

  get esRecogerTienda(): boolean {
    return this.pago?.metodo === 'RECOGER_TIENDA';
  }
}
