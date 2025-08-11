import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { B2cBillingComponent } from './b2c-billing.component';

const routes: Routes = [
  { path: '', component: B2cBillingComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    B2cBillingComponent
  ],
    exports: [RouterModule],
})
export class B2cBillingModule { }
