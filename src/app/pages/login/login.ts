import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  contrasena = '';
  cargando = false;
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  onSubmit() {
    if (!this.email || !this.contrasena) return;

    this.cargando = true;
    this.mensajeError = '';

    this.authService.login(this.email, this.contrasena).subscribe({
      next: (response) => {
        this.cargando = false;
        this.cdr.detectChanges();

        // 🧭 Redirección según el rol del usuario
        if (response.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/productos']);
        }
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.mensajeError = '❌ Credenciales incorrectas o error en el servidor.';
        this.cdr.detectChanges();
      }
    });
  }
}
