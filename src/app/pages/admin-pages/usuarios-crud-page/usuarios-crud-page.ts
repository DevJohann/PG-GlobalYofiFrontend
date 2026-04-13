import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-usuarios-crud-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-crud-page.component.html',
  styleUrls: ['./usuarios-crud-page.css']
})
export class UsuariosCrudPageComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtro: string = '';
  cargando = true;

  constructor(
    private usuarioService: UsuarioService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.aplicarFiltro();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.notificationService.error('No se pudieron cargar los usuarios.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.filtro) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      const f = this.filtro.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(u => 
        u.nombre.toLowerCase().includes(f) || u.email.toLowerCase().includes(f)
      );
    }
  }

  cambiarRol(usuario: Usuario, nuevoRol: string): void {
    if (confirm(`¿Estás seguro de cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`)) {
      this.usuarioService.asignarRol(usuario.idUsuario, nuevoRol).subscribe({
        next: (res) => {
          usuario.rol = res.rol;
          this.notificationService.success(`✅ Rol actualizado para ${usuario.nombre}.`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('Error al actualizar el rol.');
        }
      });
    }
  }

  toggleActivo(usuario: Usuario): void {
    const nuevoEstado = !usuario.activo;
    this.usuarioService.cambiarEstado(usuario.idUsuario, nuevoEstado).subscribe({
      next: (res) => {
        usuario.activo = res.activo;
        const msg = res.activo ? 'activado' : 'desactivado';
        this.notificationService.success(`✅ Usuario ${usuario.nombre} ${msg}.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Error al cambiar el estado del usuario.');
      }
    });
  }
}
