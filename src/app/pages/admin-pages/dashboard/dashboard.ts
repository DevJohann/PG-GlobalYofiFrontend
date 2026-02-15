import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  constructor(private authService: AuthService, private router: Router) {}
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
