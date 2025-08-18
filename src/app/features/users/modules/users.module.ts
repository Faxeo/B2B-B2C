import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users/users.component';
import { CustomerLoginComponent } from './customer-login/customer-login.component';
import { BusinessLoginComponent } from './business-login/business-login.component';
import { MerchantLoginComponent } from './merchant-login/merchant-login.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { FormsModule } from '@angular/forms';
import { AdminDashboardComponent } from '../../../dashboard/admin-dashboard/admin-dashboard.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar/sidebar.component';


@NgModule({
  declarations: [
    UsersComponent,
    CustomerLoginComponent,
    BusinessLoginComponent,
    MerchantLoginComponent,
    AdminSidebarComponent,
    
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    FormsModule,
    SidebarComponent,
    AdminDashboardComponent
  ],
  exports: [UsersRoutingModule]
})
export class UsersModule { }
