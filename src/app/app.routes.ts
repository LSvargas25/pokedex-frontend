import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './Guards/auth-guard';
import { DeviceScreen } from './Services/Navigation/device-navigation';

/**
 * Las pantallas del Pokédex no se renderizan en el <router-outlet>: el dispositivo
 * lee `data.screen` de la URL (ver DeviceNavigation). Estas rutas usan un
 * componente vacío solo para existir en el router.
 */
@Component({ selector: 'app-device-route', template: '' })
export class DeviceRoute {}

const screen = (name: DeviceScreen) => ({ screen: name });

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: DeviceRoute },
  { path: 'search', component: DeviceRoute, data: screen('Pokémon Search') },
  { path: 'poked', component: DeviceRoute, data: screen('Poked'), canActivate: [authGuard] },
  { path: 'trainer', component: DeviceRoute, data: screen('Trainer Info'), canActivate: [authGuard] },
  { path: 'settings', component: DeviceRoute, data: screen('Settings') },
  { path: 'login', component: DeviceRoute, data: screen('Login') },
  { path: '**', redirectTo: '' },
];
