import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ReportesService } from '../../../services/reportes-service';

Chart.register(...registerables);

@Component({
  selector: 'app-clientes-report-page',
  imports: [],
  templateUrl: './clientes-report-page.html',
  styleUrl: './clientes-report-page.css',
})
export class ClientesReportPageComponent implements OnInit {

  @ViewChild('clientesChart') clientesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('estadoPedidosChart') estadoPedidosChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cargarGraficos();
  }

  cargarGraficos(): void {
    this.cargarClientesFrecuentes();
    this.cargarPedidosPorEstado();
  }

  private cargarClientesFrecuentes(): void {
    this.reportesService.getClientesFrecuentes().subscribe({
      next: (data) => {
        const labels = data.map(c => c.cliente);
        const valores = data.map(c => c.totalPedidos);

        new Chart(this.clientesChartRef.nativeElement, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Total de pedidos',
              data: valores,
              backgroundColor: '#ec407a'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Clientes con más pedidos',
                font: { size: 16 }
              },
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      },
      error: (err) => console.error('Error al cargar clientes frecuentes:', err)
    });
  }

  private cargarPedidosPorEstado(): void {
    this.reportesService.getPedidosPorEstado().subscribe({
      next: (data) => {
        const labels = Object.keys(data);
        const valores = Object.values(data);

        new Chart(this.estadoPedidosChartRef.nativeElement, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: valores,
              backgroundColor: ['#ff80ab', '#f06292', '#ce93d8', '#ba68c8']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Estado de los pedidos',
                font: { size: 16 }
              }
            }
          }
        });
      },
      error: (err) => console.error('Error al cargar pedidos por estado:', err)
    });
  }
}
