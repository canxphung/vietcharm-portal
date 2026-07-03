import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.HomePageComponent),
  },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'regions', redirectTo: '', pathMatch: 'full' },
  {
    path: 'discover',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.ProvincesPageComponent),
  },
  { path: 'provinces', redirectTo: 'discover', pathMatch: 'full' },
  {
    path: 'province/:provinceId',
    loadComponent: () =>
      import('./pages/province-detail.page').then((m) => m.ProvinceDetailPageComponent),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.ServicesPageComponent),
  },
  { path: 'services/all', redirectTo: 'services', pathMatch: 'full' },
  {
    path: 'services/provinces',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.ServiceProvincesPageComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/account.pages').then((m) => m.CartPageComponent),
  },
  { path: 'basket', redirectTo: 'cart', pathMatch: 'full' },
  { path: 'checkout', redirectTo: 'cart', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/account.pages').then((m) => m.AuthPageComponent),
  },
  { path: 'signin', redirectTo: 'login', pathMatch: 'full' },
  { path: 'auth/login', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/account.pages').then((m) => m.AuthPageComponent),
  },
  { path: 'signup', redirectTo: 'register', pathMatch: 'full' },
  { path: 'auth/register', redirectTo: 'register', pathMatch: 'full' },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/account.pages').then((m) => m.AuthPageComponent),
  },
  { path: 'forgot', redirectTo: 'forgot-password', pathMatch: 'full' },
  { path: 'auth/forgot-password', redirectTo: 'forgot-password', pathMatch: 'full' },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/account.pages').then((m) => m.ProfilePageComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/account.pages').then((m) => m.AdminPageComponent),
  },
  {
    path: 'ai-explorer',
    loadComponent: () =>
      import('./pages/trip.pages').then((m) => m.AiExplorerPageComponent),
  },
  {
    path: 'blind-travel',
    loadComponent: () =>
      import('./pages/trip.pages').then((m) => m.BlindTravelPageComponent),
  },
  {
    path: 'trip-room',
    loadComponent: () =>
      import('./pages/trip.pages').then((m) => m.TripRoomPageComponent),
    canActivate: [authGuard],
  },
  { path: 'group-trip', redirectTo: 'trip-room', pathMatch: 'full' },
  {
    path: 'taxi',
    loadComponent: () =>
      import('./pages/trip.pages').then((m) => m.TaxiPageComponent),
  },
  {
    path: 'tours',
    loadComponent: () =>
      import('./pages/trip.pages').then((m) => m.ToursPageComponent),
  },
  {
    path: 'handbook',
    loadComponent: () =>
      import('./pages/trip.pages').then((m) => m.HandbookPageComponent),
  },
  {
    path: 'partnership',
    loadComponent: () =>
      import('./pages/trip.pages').then((m) => m.PartnershipPageComponent),
    canActivate: [authGuard],
  },
  { path: 'partner', redirectTo: 'partnership', pathMatch: 'full' },
  { path: 'partnership-register', redirectTo: 'partnership', pathMatch: 'full' },
  {
    path: 'recently-viewed',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.RecentlyViewedPageComponent),
  },
  {
    path: 'nearby-places',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.NearbyPlacesPageComponent),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.NotFoundPageComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/discovery.pages').then((m) => m.NotFoundPageComponent),
  },
];
