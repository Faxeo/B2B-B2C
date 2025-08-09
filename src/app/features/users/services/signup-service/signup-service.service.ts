import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private router: Router) {}

  openSignUpPage() {
    this.router.navigate(['/sidebar/signup']);
  }
}
