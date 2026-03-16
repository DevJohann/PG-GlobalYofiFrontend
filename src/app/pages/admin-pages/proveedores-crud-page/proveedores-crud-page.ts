import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proveedores-crud-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>🚛 Gestión de Proveedores</h1>
      <p>Próximamente: Implementación del CRUD de proveedores.</p>
      <div style="padding: 3rem; border: 2px dashed #ddd; border-radius: 8px; text-align: center; color: #888;">
        Vista en construcción 🏗️
      </div>
    </div>
  `
})
export class ProveedoresCrudPage {}
