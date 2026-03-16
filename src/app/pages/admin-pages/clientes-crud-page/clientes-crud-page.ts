import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes-crud-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>👥 Gestión de Clientes</h1>
      <p>Próximamente: Implementación del CRUD de clientes y perfiles.</p>
      <div style="padding: 3rem; border: 2px dashed #ddd; border-radius: 8px; text-align: center; color: #888;">
        Vista en construcción 🏗️
      </div>
    </div>
  `
})
export class ClientesCrudPage {}
