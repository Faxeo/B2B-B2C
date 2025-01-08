import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { B2cCartComponent } from './b2c-cart.component';


const routes: Routes = [
  {
    path: 'cart',
    component: B2cCartComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes), // Configure child routes
    B2cCartComponent
  ],
  exports: [RouterModule],
})
export class B2cCartModule { }
 