import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { AuthService } from './services/auth';
import { CarritoService } from './services/carrito.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  isAdminRoute = false;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.checkStatus();

    // 🛒 Cargar carrito si ya hay sesión al iniciar la app
    const user = this.authService.getUser();
    if (user && user.rol !== 'ADMIN') {
      this.carritoService.getCartByClientId(user.id).subscribe();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkStatus();
    });
  }

  private checkStatus(): void {
    this.isAdminRoute = this.router.url.startsWith('/admin');
  }
}
