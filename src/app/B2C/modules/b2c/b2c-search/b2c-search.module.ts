import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { B2cSearchComponent } from './b2c-search.component';

const routes: Routes = [
  {
    path: 'search',
    component: B2cSearchComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes), // Configure child routes
    B2cSearchComponent
  ],
  exports: [RouterModule],
})
export class B2cSearchModule {}
