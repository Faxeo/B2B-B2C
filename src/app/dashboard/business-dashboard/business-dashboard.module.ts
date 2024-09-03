import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BusinessDashboardComponent } from './business-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessDashboardComponent,
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
export class BusinessDashboardModule { }
