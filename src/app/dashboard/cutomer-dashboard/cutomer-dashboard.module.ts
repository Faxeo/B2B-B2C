import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CutomerDashboardComponent } from './cutomer-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: CutomerDashboardComponent,
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
export class CutomerDashboardModule { }
  