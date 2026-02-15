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

export const routes: Routes = [
    { path: '', component: Landing },
    {path:  'productos', component: ProductsPage},
    {path: 'login', component: Login},
    {path: 'registro', component: Register},
    {path: 'admin', component: Dashboard,
        children: [
            {path: 'reportes-productos', component: ProductosReportPage},
            {path: 'reportes-ventas', component: VentasReportPageComponent},
            {path: 'reportes-clientes', component: ClientesReportPageComponent},
            {path: 'reportes-inventario', component: InventarioReportPageComponent},
            {path: 'crud-productos', component: ProductosCrudPage}
        ]
    }
];
