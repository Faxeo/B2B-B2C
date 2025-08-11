import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { CustomerLoginComponent } from './customer-login/customer-login.component';
import { BusinessLoginComponent } from './business-login/business-login.component';
import { MerchantLoginComponent } from './merchant-login/merchant-login.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminDashboardComponent } from '../../dashboard/admin-dashboard/admin-dashboard.component';
import { DashboardComponent } from '../../dashboard/dashboard.component';

const routes: Routes = [
  {  
    path: '',
    component: UsersComponent
  },
  {
    path: 'customerlogin',
    component: CustomerLoginComponent
  },
  {
    path: 'businesslogin',
    component: BusinessLoginComponent
  },
  {
    path: 'merchantlogin',
    component: MerchantLoginComponent
  },
  {
    path: 'adminlogin',
    component: AdminSidebarComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // children: [
    //   {
    //     path: 'admin',
    //     component: AdminDashboardComponent
    //   }
    // ]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }