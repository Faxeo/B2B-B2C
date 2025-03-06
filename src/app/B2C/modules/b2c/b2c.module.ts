import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { B2CHomeComponent } from './b2c-home/b2c-home.component';
import { B2CRoutingModule } from './b2c-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { B2cComponent } from './b2c.component';

const routes: Routes = [
  {
    path: '',
    component: B2cComponent,
    children: [
      {
        path: 'search',
        loadChildren: () =>
          import('./b2c-search/b2c-search.module').then(
            (m) => m.B2cSearchModule
          ),
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('./b2c-cart/b2c-cart.module').then(
            (m) => m.B2cCartModule),  
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('./b2c-checkout/b2c-checkout.module').then(
            (m) => m.B2CCheckoutModule),  
      },
      {
        path: 'bill',
        loadChildren: () =>
          import('./b2c-billing/b2c-billing.module').then(
            (m) => m.B2cBillingModule),  
      },
      {
        path: 'login',
        loadChildren: () =>
          import('./b2c-login/b2c-login.module').then(
            (m) => m.B2cLoginModule
          ),
      },
    ]
  },
];


@NgModule({
  declarations: [],
  imports: [
    // B2CHomeComponent,
    CommonModule,
    RouterModule.forChild(routes),
    B2CRoutingModule,
    RouterModule
  ],
  exports: [RouterModule],
})
export class B2CModule {}
 