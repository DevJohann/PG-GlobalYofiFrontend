import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService, Proveedor } from '../../../services/proveedor-service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-proveedores-crud-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores-crud-page.html',
  styleUrls: ['./proveedores-crud-page.css']
})
export class ProveedoresCrudPage implements OnInit {
  proveedores: Proveedor[] = [];
  cargando = false;
  
  // Modal y Formulario
  mostrarModal = false;
  modoEdicion = false;
  proveedorForm: Proveedor = this.initForm();

  constructor(
    private proveedorService: ProveedorService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  initForm(): Proveedor {
    return {
      nombre: '',
      nit: '',
      contactoPrincipal: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      estado: 'ACTIVO'
    };
  }

  cargarProveedores(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    this.proveedorService.getProveedoresAdmin().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(): void {
    this.modoEdicion = false;
    this.proveedorForm = this.initForm();
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  editarProveedor(prov: Proveedor): void {
    this.modoEdicion = true;
    this.proveedorForm = { ...prov };
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  guardarProveedor(event: Event): void {
    event.preventDefault();
    if (!this.proveedorForm.nombre || !this.proveedorForm.nit) return;

    if (this.modoEdicion && this.proveedorForm.id) {
      this.proveedorService.actualizarProveedor(this.proveedorForm.id, this.proveedorForm).subscribe({
        next: () => {
          this.notificationService.success('✅ Proveedor actualizado con éxito');
          this.cerrarModal();
          this.cargarProveedores();
        },
        error: (err) => {
          console.error('Error al actualizar', err);
          this.notificationService.error('No se pudo actualizar el proveedor.');
        }
      });
    } else {
      this.proveedorService.crearProveedor(this.proveedorForm).subscribe({
        next: () => {
          this.notificationService.success('✅ Proveedor registrado con éxito');
          this.cerrarModal();
          this.cargarProveedores();
        },
        error: (err) => {
          console.error('Error al registrar', err);
          this.notificationService.error('No se pudo registrar el proveedor.');
        }
      });
    }
  }

  async eliminarProveedor(id: number): Promise<void> {
    const confirmada = await this.notificationService.confirm('¿Deseas cambiar el estado (Activar/Desactivar) de este proveedor? El proveedor no se borrará físicamente.');
    if (confirmada) {
      this.proveedorService.eliminarProveedor(id).subscribe({
        next: () => {
          this.notificationService.success('✅ Estado del proveedor actualizado');
          this.cargarProveedores();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.notificationService.error('🚨 No se pudo eliminar el proveedor. Verifique si tiene productos o compras asociadas.');
        }
      });
    }
  }
}
