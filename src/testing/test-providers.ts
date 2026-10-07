import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

/** Providers comunes de los specs: HttpClient sin red real y un router vacío. */
export const testProviders = [provideHttpClient(), provideHttpClientTesting(), provideRouter([])];
