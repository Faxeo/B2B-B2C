import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { B2CHomeComponent } from '../../B2C/modules/b2c/b2c-home/b2c-home.component';
import { HomeComponent } from '../home/home.component';


@Component({
    selector: 'app-home-wrapper',
    imports: [HomeComponent, B2CHomeComponent],
    template: `
    @if (loginType === 'business') {
      <app-home></app-home> <!-- B2B HomeComponent -->
    }
    @if (loginType !== 'business') {
      <app-b2c-home></app-b2c-home> <!-- B2C HomeComponent -->
    }
    `
})
export class HomeWrapperComponent implements OnInit {
    
  loginType: string | null = null;

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    this.loginService.getLoginType().subscribe((type) => {
      this.loginType = type;
    });
  }
}
