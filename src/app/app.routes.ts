import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'regions', redirectTo: '', pathMatch: 'full' },
  {
    path: 'discover',
    loadComponent: () =>
      import('./pages/discover/discover.component').then((m) => m.DiscoverComponent),
  },
  { path: 'provinces', redirectTo: 'discover', pathMatch: 'full' },
  {
    path: 'province/:provinceId',
    loadComponent: () =>
      import('./pages/province-detail/province-detail.component').then((m) => m.ProvinceDetailComponent),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services.component').then((m) => m.ServicesComponent),
  },
  { path: 'services/all', redirectTo: 'services', pathMatch: 'full' },
  {
    path: 'services/provinces',
    loadComponent: () =>
      import('./pages/service-provinces/service-provinces.component').then((m) => m.ServiceProvincesComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  { path: 'basket', redirectTo: 'cart', pathMatch: 'full' },
  { path: 'checkout', redirectTo: 'cart', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  { path: 'signin', redirectTo: 'login', pathMatch: 'full' },
  { path: 'auth/login', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  { path: 'signup', redirectTo: 'register', pathMatch: 'full' },
  { path: 'auth/register', redirectTo: 'register', pathMatch: 'full' },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  { path: 'forgot', redirectTo: 'forgot-password', pathMatch: 'full' },
  { path: 'auth/forgot-password', redirectTo: 'forgot-password', pathMatch: 'full' },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'ai-explorer',
    loadComponent: () =>
      import('./pages/ai-explorer/ai-explorer.component').then((m) => m.AiExplorerComponent),
  },
  {
    path: 'blind-travel',
    loadComponent: () =>
      import('./pages/blind-travel/blind-travel.component').then((m) => m.BlindTravelComponent),
  },
  {
    path: 'trip-room',
    loadComponent: () =>
      import('./pages/trip-room/trip-room.component').then((m) => m.TripRoomComponent),
    canActivate: [authGuard],
  },
  { path: 'group-trip', redirectTo: 'trip-room', pathMatch: 'full' },
  {
    path: 'taxi',
    loadComponent: () =>
      import('./pages/taxi/taxi.component').then((m) => m.TaxiComponent),
  },
  {
    path: 'tours',
    loadComponent: () =>
      import('./pages/tours/tours.component').then((m) => m.ToursComponent),
  },
  {
    path: 'handbook',
    loadComponent: () =>
      import('./pages/handbook/handbook.component').then((m) => m.HandbookComponent),
  },
  {
    path: 'partnership',
    loadComponent: () =>
      import('./pages/partnership/partnership.component').then((m) => m.PartnershipComponent),
    canActivate: [authGuard],
  },
  { path: 'partner', redirectTo: 'partnership', pathMatch: 'full' },
  { path: 'partnership-register', redirectTo: 'partnership', pathMatch: 'full' },
  {
    path: 'recently-viewed',
    loadComponent: () =>
      import('./pages/recently-viewed/recently-viewed.component').then((m) => m.RecentlyViewedComponent),
  },
  {
    path: 'nearby-places',
    loadComponent: () =>
      import('./pages/nearby-places/nearby-places.component').then((m) => m.NearbyPlacesComponent),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
