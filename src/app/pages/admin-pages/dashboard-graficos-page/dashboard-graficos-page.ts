import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-graficos-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>📊 Dashboard General</h1>
      <p>Bienvenido al centro de control. Aquí podrás ver un resumen rápido del estado de Global Yofi.</p>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem;">
        <div style="padding: 1.5rem; background: #fce4ec; border-radius: 12px; border: 1px solid #f8bbd0;">
          <h3 style="color: #d81b60; margin: 0;">📦 Pedidos Hoy</h3>
          <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">--</p>
        </div>
        <div style="padding: 1.5rem; background: #e3f2fd; border-radius: 12px; border: 1px solid #bbdefb;">
          <h3 style="color: #1976d2; margin: 0;">💰 Ventas Mes</h3>
          <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">--</p>
        </div>
        <div style="padding: 1.5rem; background: #e8f5e9; border-radius: 12px; border: 1px solid #c8e6c9;">
          <h3 style="color: #2e7d32; margin: 0;">👥 Clientes Nuevos</h3>
          <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">--</p>
        </div>
      </div>

      <div style="margin-top: 3rem; padding: 3rem; border: 2px dashed #ddd; border-radius: 12px; text-align: center; color: #888;">
        Gráficos detallados cargando... 📈
      </div>
    </div>
  `
})
export class DashboardGraficosPage {}
