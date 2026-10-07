import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../Services/Auth/auth-service';
import { unauthorizedInterceptor } from './unauthorized-interceptor';

describe('unauthorizedInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: jasmine.SpyObj<Pick<AuthService, 'signOutLocal'>>;
  let router: Router;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', { signOutLocal: Promise.resolve() });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([unauthorizedInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('un 401 del backend cierra la sesión local y manda al login', async () => {
    const failed = jasmine.createSpy('error');
    http.get(`${environment.apiBaseUrl}/api/trainer/me`).subscribe({ error: failed });
    backend
      .expectOne(`${environment.apiBaseUrl}/api/trainer/me`)
      .flush({ error: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();

    expect(failed).toHaveBeenCalled();
    expect(auth.signOutLocal).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/' } });
  });

  it('otros errores no tocan la sesión', () => {
    http.get(`${environment.apiBaseUrl}/api/trainer/me`).subscribe({ error: () => undefined });
    backend
      .expectOne(`${environment.apiBaseUrl}/api/trainer/me`)
      .flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(auth.signOutLocal).not.toHaveBeenCalled();
  });
});
