import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { ProductosService, Producto } from '../../services/productos';
import { CategoriaService, Categoria } from '../../services/categoria-service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products-page.html',
  styleUrls: ['./products-page.css']
})
export class ProductsPage implements OnInit, OnDestroy {

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  filtroCategoria: number | null = null;
  filtroMin: number = 0;
  filtroMax: number = 1000000;
  cargando = false;

  private destroy$ = new Subject<void>();

  constructor(
    private productoService: ProductosService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  // =========================================================
  // 🚀 Inicialización
  // =========================================================
  ngOnInit(): void {
    // ✅ Cargar datos al inicio
    this.cargarCategorias();
    this.cargarProductos();

    // ✅ Detectar cuando se navega nuevamente a esta ruta
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.router.url === '/productos') {
          this.cargarProductos();
        }
      });
  }

  // =========================================================
  // 📦 Cargar productos
  // =========================================================
  cargarProductos(): void {
    this.cargando = true;
    this.productoService.getProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.productos = data;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('❌ Error al cargar productos:', err);
          this.cargando = false;
        }
      });
  }

  // =========================================================
  // 🏷️ Cargar categorías
  // =========================================================
  cargarCategorias(): void {
    this.categoriaService.getCategorias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.categorias = data;
          this.cdr.detectChanges();
        },
        error: err => console.error('❌ Error al cargar categorías:', err)
      });
  }

  // =========================================================
  // 🔍 Filtros de productos
  // =========================================================
  aplicarFiltro(): void {
    this.cargando = true;
    let request$;

    if (this.filtroCategoria && (this.filtroMin || this.filtroMax)) {
      request$ = this.productoService.getByCategoriaYPrecio(this.filtroCategoria, this.filtroMin, this.filtroMax);
    } else if (this.filtroCategoria) {
      request$ = this.productoService.getByCategoria(this.filtroCategoria);
    } else if (this.filtroMin || this.filtroMax) {
      request$ = this.productoService.getByPrecio(this.filtroMin, this.filtroMax);
    } else {
      request$ = this.productoService.getProductos();
    }

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.productos = data;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('❌ Error al aplicar filtro:', err);
          this.cargando = false;
        }
      });
  }

  // =========================================================
  // 🧹 Limpieza
  // =========================================================
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
