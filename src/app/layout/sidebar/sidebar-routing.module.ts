import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CustomerLoginComponent } from '../../modules/users/customer-login/customer-login.component';
import { BusinessLoginComponent } from '../../modules/users/business-login/business-login.component';
import { MerchantLoginComponent } from '../../modules/users/merchant-login/merchant-login.component';
import { AdminSidebarComponent } from '../../modules/users/admin-sidebar/admin-sidebar.component';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { AdminDashboardComponent } from '../../dashboard/admin-dashboard/admin-dashboard.component';
import { SignupComponent } from './sign-up/sign-up.component';


const routes: Routes = [
  {
    path: '',
    component: SidebarComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'customer',
    component: CustomerLoginComponent
  },
  {
    path: 'business',
    component: BusinessLoginComponent
  },
  {
    path: 'merchant',
    component: MerchantLoginComponent
  },
  {
    path: 'admin',
    component: AdminSidebarComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SidebarRoutingModule { }
