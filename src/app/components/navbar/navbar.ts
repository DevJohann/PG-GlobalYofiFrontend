import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent implements OnInit {
  userEmail: string | null = null;
  isLoggedIn = false;
  searchQuery = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    public carritoService: CarritoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userEmail = user ? user.email : null;
      this.cdr.detectChanges();
    });

    // 🛒 Escuchar cambios en el carrito para actualizar el badge de la navbar en tiempo real
    this.carritoService.cart$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout();
    this.carritoService.vaciarEstado();
    this.isLoggedIn = false;
    this.userEmail = null;
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/productos'], { queryParams: { search: this.searchQuery } });
    }
  }

  scrollToSection(sectionId: string): void {
    // Si estamos en el home, scrollear. Si no, ir al home con el ancla.
    if (this.router.url === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -70;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      this.router.navigate(['/'], { fragment: sectionId });
    }
  }
}
