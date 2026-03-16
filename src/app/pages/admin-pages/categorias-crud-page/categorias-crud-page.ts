import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categorias-crud-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <h1>⚙️ Gestión de Categorías</h1>
      <p>Próximamente: Implementación del CRUD de categorías.</p>
      <div style="padding: 3rem; border: 2px dashed #ddd; border-radius: 8px; text-align: center; color: #888;">
        Vista en construcción 🏗️
      </div>
    </div>
  `
})
export class CategoriasCrudPage {}
