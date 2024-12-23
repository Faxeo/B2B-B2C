import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../core/services/login-service/login-service.service';
import { B2CHomeComponent } from '../../B2C/modules/b2c/b2c-home/b2c-home.component';
import { HomeComponent } from '../home/home.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-wrapper',
  standalone: true,
  imports: [HomeComponent, B2CHomeComponent, CommonModule],

  template: `
    <ng-container *ngIf="loginType === 'business'">
      <app-home></app-home> <!-- B2B HomeComponent -->
    </ng-container>
    <ng-container *ngIf="loginType !== 'business'">
      <app-b2c-home></app-b2c-home> <!-- B2C HomeComponent -->
    </ng-container>
  `,
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
