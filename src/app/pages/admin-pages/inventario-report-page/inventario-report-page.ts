import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ReportesService } from '../../../services/reportes-service';
import { CommonModule } from '@angular/common'; 

Chart.register(...registerables);

@Component({
  selector: 'app-inventario-report-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario-report-page.html',
  styleUrls: ['./inventario-report-page.css'],
})
export class InventarioReportPageComponent implements OnInit, AfterViewInit {

  @ViewChild('rotacionChart') rotacionChartRef!: ElementRef<HTMLCanvasElement>;
  historialInventario: any[] = [];

  // ✅ Inyectamos ChangeDetectorRef
  constructor(
    private reportesService: ReportesService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    const token = localStorage?.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token disponible, redirigiendo al login...');
      window.location.href = '/login';
    }
  }

  ngAfterViewInit(): void {
    this.cargarReportes();
  }

  /** 🔄 Cargar todos los reportes de inventario */
  private cargarReportes(): void {
    this.cargarRotacionInventario();
    this.cargarHistorialInventario();
  }

  /** 📊 Rotación de inventario */
  private cargarRotacionInventario(): void {
    this.reportesService.getRotacionInventario().subscribe({
      next: (data) => {
        const labels = data.map(i => i.producto);
        const entradas = data.map(i => i.entradas);
        const salidas = data.map(i => i.salidas);

        new Chart(this.rotacionChartRef.nativeElement, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'Entradas', data: entradas, backgroundColor: '#81c784' },
              { label: 'Salidas', data: salidas, backgroundColor: '#e57373' }
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
              title: { display: true, text: 'Rotación de Inventario', font: { size: 16 } },
              legend: { position: 'bottom' }
            },
            scales: { x: { beginAtZero: true } }
          }
        });
      },
      error: (err) => console.error('❌ Error al cargar rotación de inventario:', err)
    });
  }

  /** 📜 Historial de movimientos de inventario */
  private cargarHistorialInventario(): void {
    this.reportesService.getHistorialInventario().subscribe({
      next: (data) => {
        console.log('📥 Historial de inventario cargado:', data);

        this.historialInventario = data.map(item => ({
          producto: item.producto,
          tipoMovimiento: item.tipoMovimiento,
          cantidad: item.cantidad,
          fecha: item.fecha,
          usuario: item.usuario
        }));

        // 👇 Forzamos que Angular actualice la vista inmediatamente
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error al cargar historial de inventario:', err)
    });
  }
}
