import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfiguracionService, ConfiguracionDTO } from '../../services/configuracion.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class FooterComponent implements OnInit {
  config: ConfiguracionDTO | null = null;
  
  constructor(private configService: ConfiguracionService) {}

  ngOnInit() {
    this.configService.getConfig().subscribe(config => {
      this.config = config;
    });
  }
}
