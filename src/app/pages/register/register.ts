import { Component, ChangeDetectorRef } from '@angular/core';
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
  repetirContrasena = '';
  telefono = '';
  rol = 'CLIENTE';
  cargando = false;
  mensaje = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  // Filtro para solo letras (incluye acentos y espacios)
  soloLetras(event: KeyboardEvent) {
    const pattern = /[a-zA-ZáéíóúÁÉÍÓÚñÑ ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar) && event.charCode !== 0) {
      event.preventDefault();
    }
  }

  // Sanitización para evitar pegar caracteres inválidos
  sanitizarLetras(campo: 'nombre' | 'apellido') {
    this[campo] = this[campo].replace(/^ +/g, ''); // Evitar espacios al inicio
    this[campo] = this[campo].replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
  }

  // Filtro para solo números y el signo +
  soloNumeros(event: KeyboardEvent) {
    const pattern = /[0-9+]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar) && event.charCode !== 0) {
      event.preventDefault();
    }
  }

  sanitizarNumeros() {
    this.telefono = this.telefono.replace(/[^0-9+]/g, '');
  }

  // Validación de contraseña segura
  esContrasenaSegura(pass: string): boolean {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  }

  // Validación de formato de email
  esEmailValido(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  onSubmit() {
    // Validaciones previas al envío
    if (!this.nombre || !this.apellido || !this.email || !this.contrasena || !this.telefono) {
      this.mensaje = '⚠️ Por favor, completa todos los campos.';
      return;
    }

    if (!this.esEmailValido(this.email)) {
      this.mensaje = '⚠️ El formato del correo electrónico no es válido.';
      return;
    }

    if (!this.esContrasenaSegura(this.contrasena)) {
      this.mensaje = '⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
      return;
    }

    if (this.contrasena !== this.repetirContrasena) {
      this.mensaje = '⚠️ Las contraseñas no coinciden.';
      return;
    }

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
        this.cdr.detectChanges();
        alert('Registro exitoso');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        this.cargando = false;
        this.mensaje = '❌ Error al registrar el usuario. Verifica tus datos o intenta con otro correo.';
        this.cdr.detectChanges();
      }
    });
  }
}
