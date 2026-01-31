import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout/main-layout.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.Home)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/menu/menu.component').then(m => m.Menu)
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then(m => m.About)
      },
      {
        path: 'reservation',
        loadComponent: () => import('./features/reservation/reservation.component').then(m => m.Reservation)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/category/category.component').then(m => m.CategoryComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'tables',
        loadComponent: () => import('./features/admin/tables/tables.component').then(m => m.TablesComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  }
];
