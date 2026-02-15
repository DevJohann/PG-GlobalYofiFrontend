import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ReportesService } from '../../../services/reportes-service';

Chart.register(...registerables);

@Component({
  selector: 'app-productos-report-page',
  standalone: true,
  imports: [],
  templateUrl: './productos-report-page.html',
  styleUrls: ['./productos-report-page.css'],
})
export class ProductosReportPage implements OnInit {
  @ViewChild('categoriaChart') categoriaChart!: ElementRef;
  @ViewChild('proveedorChart') proveedorChart!: ElementRef;
  @ViewChild('precioChart') precioChart!: ElementRef;

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cargarGraficos();
  }

  cargarGraficos(): void {
    this.reportesService.getProductosPorCategoria().subscribe((data) => {
      this.renderPieChart(this.categoriaChart, data, 'Productos por Categoría');
    });

    this.reportesService.getStockPorProveedor().subscribe((data) => {
      this.renderPieChart(this.proveedorChart, data, 'Stock por Proveedor');
    });

    this.reportesService.getTopProductosPorPrecio().subscribe((data) => {
      this.renderBarChart(this.precioChart, data, 'Top Productos Más Caros');
    });
  }

  renderPieChart(canvasRef: ElementRef, data: Record<string, number>, title: string) {
    const labels = Object.keys(data);
    const values = Object.values(data);

    new Chart(canvasRef.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ['#ffb6c1', '#ff69b4', '#db7093', '#ff1493', '#ffc0cb']
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title,
            color: '#d63384',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            labels: { color: '#333' }
          }
        }
      }
    });
  }

  renderBarChart(canvasRef: ElementRef, data: Record<string, number>, title: string) {
    const labels = Object.keys(data);
    const values = Object.values(data);

    new Chart(canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Precio (COP)',
            data: values,
            backgroundColor: '#ff69b4'
          }
        ]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: title,
            color: '#d63384',
            font: { size: 18, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#333' }, grid: { color: '#fcd1d1' } },
          y: { ticks: { color: '#333' }, grid: { color: '#fcd1d1' } }
        }
      }
    });
  }
}