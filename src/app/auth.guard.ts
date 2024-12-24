import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './core/services/login-service/login-service.service';
import { Observable, map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const router = inject(Router);
  const loginService = inject(LoginService);

  return loginService.getLoginType().pipe(
    map(userType => {
      if (userType === 'business' && state.url.includes('/B2C')) {
        router.navigate(['/B2B']);
        return false;
      }
      return true;
    })
  );
};