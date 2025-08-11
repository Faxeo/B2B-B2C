import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { B2cLoginComponent } from './b2c-login.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'login',
    component: B2cLoginComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes), // Configure child routes
    B2cLoginComponent
  ],
  exports: [RouterModule],
})
export class B2cLoginModule { }
 