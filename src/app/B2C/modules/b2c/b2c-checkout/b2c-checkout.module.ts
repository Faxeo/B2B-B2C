import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { B2cCheckoutComponent } from './b2c-checkout.component';

const routes: Routes = [
  { path: '', component: B2cCheckoutComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    B2cCheckoutComponent
  ],
  exports: [RouterModule],
})
export class B2CCheckoutModule {}
