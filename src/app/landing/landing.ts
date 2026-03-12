import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class Landing implements OnInit {
  userEmail: string | null = null;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public carritoService: CarritoService
  ) { }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getUser();
      this.userEmail = user ? user.email : null;
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userEmail = null;
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -70; // deja espacio para el navbar fijo
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}
