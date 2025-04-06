import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { B2cWishlistComponent } from './b2c-wishlist.component';

const routes: Routes = [
  {
    path: '',
    component: B2cWishlistComponent,
  },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    B2cWishlistComponent
  ],
  exports: [RouterModule], 
})
export class B2CWishlistModule {}
