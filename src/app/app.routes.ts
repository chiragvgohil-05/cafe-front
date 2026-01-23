import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
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
  }
];
