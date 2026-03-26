import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { ProductosService, Producto } from '../../services/productos';
import { CategoriaService, Categoria } from '../../services/categoria-service';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito.service';

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
  selectedCategories: number[] = [];
  filtroMin: number | null = null;
  filtroMax: number | null = null;
  sortBy: string = 'default';
  cargando = false;
  searchQuery: string | null = null;
  userEmail: string | null = null;
  isLoggedIn = false;
  showFilters = true; // Para colapsar en móvil

  private destroy$ = new Subject<void>();

  constructor(
    public productoService: ProductosService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    public carritoService: CarritoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // =========================================================
  // 🚀 Inicialización
  // =========================================================
  ngOnInit(): void {
    this.cargarCategorias();
    this.checkLoginStatus();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['search'] || null;
        this.aplicarFiltro();
      });

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.router.url.startsWith('/productos')) {
          this.checkLoginStatus();
        }
      });
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
    this.carritoService.vaciarEstado();
    this.isLoggedIn = false;
    this.userEmail = null;
    this.router.navigate(['/login']);
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
  toggleCategoria(id: number): void {
    const wasSelected = this.selectedCategories.includes(id);
    this.selectedCategories = wasSelected ? [] : [id];
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    this.cargando = true;
    
    // Si la búsqueda es solo espacios, tratamos como nula
    const query = (this.searchQuery && this.searchQuery.trim() !== '') ? this.searchQuery.trim() : null;

    this.productoService.getFilterProductos(
      this.selectedCategories.length > 0 ? this.selectedCategories : null,
      this.filtroMin,
      this.filtroMax,
      query,
      this.sortBy
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.productos = data;
          // El backend ya ordena, pero podemos mantener una validación extra
          this.ordenarProductos();
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('❌ Error al aplicar filtro:', err);
          this.cargando = false;
        }
      });
  }

  ordenarProductos(): void {
    if (this.sortBy === 'price-asc') {
      this.productos.sort((a, b) => a.precio - b.precio);
    } else if (this.sortBy === 'price-desc') {
      this.productos.sort((a, b) => b.precio - a.precio);
    } else if (this.sortBy === 'name-asc') {
      this.productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  }

  reiniciarFiltros(): void {
    this.selectedCategories = [];
    this.filtroMin = null;
    this.filtroMax = null;
    this.sortBy = 'default';
    this.searchQuery = null;
    this.aplicarFiltro();
  }

  // =========================================================
  // 🧹 Limpieza
  // =========================================================
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
