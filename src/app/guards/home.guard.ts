import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../core/services/login-service/login-service.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class HomeGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.loginService.getLoginType().pipe(
      tap((loginType) => {
        if (loginType === 'business') {
          this.router.navigate(['/B2B']);
        } else {
          this.router.navigate(['/B2C']);
        }
      }),
      map((loginType) => false) // Prevent default route activation after redirection
    );
  }
}
