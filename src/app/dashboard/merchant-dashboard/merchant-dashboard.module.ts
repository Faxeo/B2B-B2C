import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MerchantDashboardComponent } from './merchant-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: MerchantDashboardComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],   
})
export class MerchantDashboardModule { }
