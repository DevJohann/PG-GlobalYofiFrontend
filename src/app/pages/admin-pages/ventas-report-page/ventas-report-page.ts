import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ReportesService } from '../../../services/reportes-service';

Chart.register(...registerables);


@Component({
  selector: 'app-ventas-report-page',
  imports: [],
  templateUrl: './ventas-report-page.html',
  styleUrls: ['./ventas-report-page.css'],
})
export class VentasReportPageComponent implements OnInit {
  @ViewChild('ventasMesChart') ventasMesChart!: ElementRef;
  @ViewChild('ventasCiudadChart') ventasCiudadChart!: ElementRef;
  @ViewChild('rentabilidadProveedorChart') rentabilidadProveedorChart!: ElementRef;

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cargarGraficos();
  }

  cargarGraficos(): void {
    this.cargarVentasPorMes();
    this.cargarVentasPorCiudad();
    this.cargarRentabilidadPorProveedor();
  }

  private cargarVentasPorMes(): void {
    this.reportesService.getVentasPorMes().subscribe(data => {
      const labels = data.map(d => `${d.mes}/${d.anio}`);
      const valores = data.map(d => d.totalVentas);

      new Chart(this.ventasMesChart.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Ventas por Mes',
              data: valores,
              backgroundColor: '#f06292'
            }
          ]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    });
  }

  private cargarVentasPorCiudad(): void {
    this.reportesService.getVentasPorCiudad().subscribe(data => {
      new Chart(this.ventasCiudadChart.nativeElement, {
        type: 'pie',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              backgroundColor: ['#f8bbd0', '#f06292', '#c2185b']
            }
          ]
        },
        options: { responsive: true }
      });
    });
  }

  private cargarRentabilidadPorProveedor(): void {
    this.reportesService.getRentabilidadPorProveedor().subscribe(data => {
      new Chart(this.rentabilidadProveedorChart.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              label: 'Rentabilidad',
              data: Object.values(data),
              backgroundColor: '#e91e63'
            }
          ]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    });
  }
}
