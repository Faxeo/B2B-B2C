import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { B2CHomeComponent } from './b2c-home.component';

const routes: Routes = [
  {
    path: '',
    component: B2CHomeComponent
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class B2cHomeModule { }
 