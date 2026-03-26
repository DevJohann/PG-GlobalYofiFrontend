import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../services/cliente-service';

@Component({
  selector: 'app-clientes-crud-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-crud-page.html',
  styleUrls: ['./clientes-crud-page.css']
})
export class ClientesCrudPage implements OnInit {
  clientes: Cliente[] = [];
  cargando = false;
  
  // Modal y Formulario
  mostrarModal = false;
  modoEdicion = false;
  clienteForm: Cliente = this.initForm();

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  initForm(): Cliente {
    return {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      identificacion: '',
      estado: 'ACTIVO'
    };
  }

  cargarClientes(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        // Normalizamos los datos para que el HTML encuentre los campos siempre
        this.clientes = data.map(c => this.normalizarCliente(c));
        this.cargando = false;
        this.cdr.detectChanges();
        console.log('✅ Clientes cargados y normalizados:', this.clientes);
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** 🧹 Normaliza un objeto cliente para manejar variaciones del backend */
  private normalizarCliente(c: any): Cliente {
    return {
      ...c,
      id: c.id || c.idCliente,
      nombre: c.nombre || c.usuario?.nombre || '',
      apellido: c.apellido || c.usuario?.apellido || '',
      email: c.email || c.usuario?.email || '',
      telefono: c.telefono || c.usuario?.telefono || '',
      identificacion: c.identificacion || c.numeroDocumento || '',
      estado: c.estado || (c.usuario?.activo !== undefined ? (c.usuario.activo ? 'ACTIVO' : 'INACTIVO') : 'ACTIVO'),
      direccion: c.direccion || '',
      ciudad: c.ciudad || ''
    };
  }

  abrirModal(): void {
    this.modoEdicion = false;
    this.clienteForm = this.initForm();
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  editarCliente(cliente: Cliente): void {
    this.modoEdicion = true;
    this.clienteForm = { ...cliente };
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  guardarCliente(event: Event): void {
    event.preventDefault();
    if (!this.clienteForm.nombre || !this.clienteForm.email) return;

    // 🚀 Preparamos el payload exacto que el backend espera
    // Mapeamos 'identificacion' a 'numeroDocumento' y anidamos los datos de usuario
    const payload: any = {
      ...this.clienteForm,
      numeroDocumento: this.clienteForm.identificacion,
      usuario: {
        ...this.clienteForm.usuario,
        nombre: this.clienteForm.nombre,
        apellido: this.clienteForm.apellido,
        email: this.clienteForm.email,
        telefono: this.clienteForm.telefono,
        activo: this.clienteForm.estado === 'ACTIVO'
      }
    };

    if (this.modoEdicion && this.clienteForm.id) {
      this.clienteService.actualizarCliente(this.clienteForm.id, payload).subscribe({
        next: () => {
          alert('✅ Perfil de cliente actualizado');
          this.cerrarModal();
          this.cargarClientes();
        },
        error: (err) => {
          console.error('Error al actualizar', err);
          alert('🚨 Error al actualizar. Revisa la consola para más detalles.');
        }
      });
    } else {
      this.clienteService.crearCliente(payload).subscribe({
        next: () => {
          alert('✅ Nuevo cliente registrado');
          this.cerrarModal();
          this.cargarClientes();
        },
        error: (err) => {
          console.error('Error al registrar', err);
          alert('🚨 Error al registrar. Revisa si el email ya existe.');
        }
      });
    }
  }

  eliminarCliente(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clienteService.eliminarCliente(id).subscribe({
        next: () => {
          alert('🗑️ Cliente eliminado');
          this.cargarClientes();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert('🚨 Error: Asegúrate de que el backend tenga implementado el método DELETE en /api/clientes/{id}');
        }
      });
    }
  }
}
