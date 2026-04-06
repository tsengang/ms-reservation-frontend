import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'customers' },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/customers.component').then((m) => m.CustomersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'drivers',
    loadComponent: () =>
      import('./features/drivers/drivers.component').then((m) => m.DriversComponent),
    canActivate: [authGuard],
  },
  {
    path: 'cars',
    loadComponent: () => import('./features/cars/cars.component').then((m) => m.CarsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./features/reservations/reservations.component').then((m) => m.ReservationsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./features/overview/overview.component').then((m) => m.OverviewComponent),
    canActivate: [authGuard],
  },
  { path: 'fleet-week', redirectTo: 'overview', pathMatch: 'full' },
  { path: '**', redirectTo: 'customers' },
];
