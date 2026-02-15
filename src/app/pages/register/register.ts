import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  nombre = '';
  apellido = '';
  email = '';
  contrasena = '';
  telefono = '';
  rol = 'CLIENTE';
  cargando = false;
  mensaje = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.cargando = true;
    this.mensaje = '';

    const data = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      contrasena: this.contrasena,
      telefono: this.telefono,
      rol: this.rol
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.cargando = false;
        this.mensaje = '✅ Registro exitoso, redirigiendo...';
        alert('Registro exitoso');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        alert('Error al registrar el usuario. Verifica tus datos.');
        this.cargando = false;
        this.mensaje = 'Error al registrar el usuario. Verifica tus datos.';
      }
    });
  }
}
