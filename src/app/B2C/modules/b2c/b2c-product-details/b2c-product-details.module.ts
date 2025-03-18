import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { B2cProductDetailsComponent } from './b2c-product-details.component';

const routes: Routes = [
  {
    path: '',
    component: B2cProductDetailsComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class B2cProductDetailsModule { }
