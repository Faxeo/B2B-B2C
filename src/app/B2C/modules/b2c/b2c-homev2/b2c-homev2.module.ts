import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { B2CHomeV2Component } from './b2c-homev2.component';

const routes: Routes = [
  {
    path: 'b2c-homev2',
    component: B2CHomeV2Component
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class B2cHomeV2Module { }
 