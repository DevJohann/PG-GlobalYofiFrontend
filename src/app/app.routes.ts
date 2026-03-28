import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { ProductsPage } from './pages/products-page/products-page';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/admin-pages/dashboard/dashboard';
import { ProductosReportPage } from './pages/admin-pages/productos-report-page/productos-report-page';
import { VentasReportPageComponent } from './pages/admin-pages/ventas-report-page/ventas-report-page';
import { ClientesReportPageComponent } from './pages/admin-pages/clientes-report-page/clientes-report-page';
import { InventarioReportPageComponent } from './pages/admin-pages/inventario-report-page/inventario-report-page';
import { ProductosCrudPage } from './pages/admin-pages/productos-crud-page/productos-crud-page';
import { PedidosCrudPage } from './pages/admin-pages/pedidos-crud-page/pedidos-crud-page';
import { CategoriasCrudPage } from './pages/admin-pages/categorias-crud-page/categorias-crud-page';
import { ProveedoresCrudPage } from './pages/admin-pages/proveedores-crud-page/proveedores-crud-page';
import { ClientesCrudPage } from './pages/admin-pages/clientes-crud-page/clientes-crud-page';
import { DashboardGraficosPage } from './pages/admin-pages/dashboard-graficos-page/dashboard-graficos-page';
import { InventarioCrearProductoComponent } from './pages/admin-pages/inventario-crear-producto/inventario-crear-producto';
import { InventarioRetirarStockComponent } from './pages/admin-pages/inventario-retirar-stock/inventario-retirar-stock';
import { ProductDetail } from './pages/product-detail/product-detail';
import { CarritoPageComponent } from './pages/carrito-page/carrito-page';
import { PagoMetodoPageComponent } from './pages/pago-metodo-page/pago-metodo-page';
import { MisPedidosPageComponent } from './pages/mis-pedidos-page/mis-pedidos-page.component';

export const routes: Routes = [
    { path: '', component: Landing },
    { path: 'productos', component: ProductsPage },
    { path: 'productos/:id', component: ProductDetail },
    { path: 'carrito', component: CarritoPageComponent },
    { path: 'pago-metodo', component: PagoMetodoPageComponent },
    { path: 'mis-pedidos', component: MisPedidosPageComponent },
    { path: 'login', component: Login },
    { path: 'registro', component: Register },
    {
        path: 'admin', component: Dashboard,
        children: [
            { path: '', redirectTo: 'graficos', pathMatch: 'full' },
            { path: 'graficos', component: DashboardGraficosPage },
            { path: 'reportes-productos', component: ProductosReportPage },
            { path: 'reportes-ventas', component: VentasReportPageComponent },
            { path: 'reportes-clientes', component: ClientesReportPageComponent },
            { path: 'reportes-inventario', component: InventarioReportPageComponent },
            { path: 'inventario-crear', component: InventarioCrearProductoComponent },
            { path: 'inventario-editar/:id', component: InventarioCrearProductoComponent },
            { path: 'inventario-retirar', component: InventarioRetirarStockComponent },
            { path: 'crud-productos', component: ProductosCrudPage },
            { path: 'pedidos-crud', component: PedidosCrudPage },
            { path: 'categorias', component: CategoriasCrudPage },
            { path: 'proveedores', component: ProveedoresCrudPage },
            { path: 'clientes-crud', component: ClientesCrudPage }
        ]
    }
];
