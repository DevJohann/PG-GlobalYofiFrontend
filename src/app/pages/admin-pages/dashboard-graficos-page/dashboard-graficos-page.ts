import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from '../../../services/reportes-service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-graficos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-graficos-page.html',
  styleUrls: ['./dashboard-graficos-page.css']
})
export class DashboardGraficosPage implements OnInit, OnDestroy {
  // KPI Data
  totalVentas = 0;
  totalPedidos = 0;
  totalClientes = 0;
  productosBajoStock = 0;
  
  cargando = false;
  serviciosNoImplementados: string[] = [];
  
  private charts: Chart[] = [];

  constructor(
    private reportesService: ReportesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  cargarDatos(): void {
    this.cargando = true;
    this.serviciosNoImplementados = [];
    this.cdr.detectChanges();

    // Reset charts if they exist
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    // Fetch Sales Trend (Main Chart)
    this.reportesService.getVentasPorMes().subscribe({
      next: (data) => {
        this.renderVentasChart(data);
        if (data.length > 0) {
          // Simplistic sum for KPI (only for current month in real app)
          this.totalVentas = data.reduce((acc, curr) => acc + curr.totalVentas, 0);
        }
        this.checkLoadingState();
      },
      error: () => this.handleError('Ventas por mes')
    });

    // Fetch Categories (Side Chart)
    this.reportesService.getProductosPorCategoria().subscribe({
      next: (data) => this.renderCategoriasChart(data),
      error: () => this.handleError('Productos por categoría')
    });

    // Fetch Orders Status (Side Chart)
    this.reportesService.getPedidosPorEstado().subscribe({
      next: (data) => {
        this.renderEstadosChart(data);
        this.totalPedidos = Object.values(data).reduce((acc, val) => acc + val, 0);
        this.checkLoadingState();
      },
      error: () => this.handleError('Pedidos por estado')
    });

    // Fetch Low Stock KPIs
    this.reportesService.getProductosBajoStock().subscribe({
      next: (data) => {
        this.productosBajoStock = data.length;
        this.cdr.detectChanges();
      },
      error: () => this.handleError('Productos bajo stock')
    });

    // Fetch Total Clients
    this.reportesService.getClientesTotal().subscribe({
      next: (count) => {
        this.totalClientes = count;
        this.cdr.detectChanges();
      },
      error: () => this.handleError('Total de clientes')
    });
  }

  private checkLoadingState(): void {
    this.cargando = false;
    this.cdr.detectChanges();
  }

  private handleError(servicio: string): void {
    this.serviciosNoImplementados.push(servicio);
    this.cargando = false;
    this.cdr.detectChanges();
  }

  private renderVentasChart(data: any[]): void {
    const ctx = document.getElementById('ventasChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => `${d.mes}/${d.anio}`),
        datasets: [{
          label: 'Ventas en $',
          data: data.map(d => d.totalVentas),
          backgroundColor: 'rgba(183, 28, 90, 0.1)',
          borderColor: '#b71c5a',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
          x: { grid: { display: false } }
        }
      }
    });
    this.charts.push(chart);
  }

  private renderCategoriasChart(data: Record<string, number>): void {
    const ctx = document.getElementById('categoriasChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: ['#b71c5a', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#34495e'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
        }
      }
    });
    this.charts.push(chart);
  }

  private renderEstadosChart(data: Record<string, number>): void {
    const ctx = document.getElementById('estadosChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Cantidad',
          data: Object.values(data),
          backgroundColor: '#3498db',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: { grid: { display: false } }
        }
      }
    });
    this.charts.push(chart);
  }
}
