import { Routes } from '@angular/router';
import { HomeGuard } from './guards/home.guard';
import { HomeComponent } from './modules/home/home.component';
import { B2CHomeComponent } from './B2C/modules/b2c/b2c-home/b2c-home.component';
import { B2cSearchComponent } from './B2C/modules/b2c/b2c-search/b2c-search.component';
import { SearchComponent } from './modules/search/search.component';
import { authGuard } from './auth.guard';
import { B2cCartComponent } from './B2C/modules/b2c/b2c-cart/b2c-cart.component';
import { B2cLoginComponent } from './B2C/modules/b2c/b2c-login/b2c-login.component';
import { BillingComponent } from './modules/billing/billing.component';
import { B2cCheckoutComponent } from './B2C/modules/b2c/b2c-checkout/b2c-checkout.component';
import { B2cBillingComponent } from './B2C/modules/b2c/b2c-billing/b2c-billing.component';
import { B2cWishlistComponent } from './B2C/modules/b2c/b2c-wishlist/b2c-wishlist.component';
import { B2CHomeV2Component } from './B2C/modules/b2c/b2c-homev2/b2c-homev2.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [HomeGuard],

    loadChildren: () =>
      import('./B2C/modules/b2c/b2c.module').then((m) => m.B2CModule),
  },
  {
    path: 'B2C',
    component: B2CHomeComponent,
    canActivate: [authGuard],
    // children: [
    //   { path: 'search', component: B2cSearchComponent }
    // ]
  },
  {
    path: 'B2C/v2',
    component: B2CHomeV2Component,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./B2C/modules/b2c/b2c-homev2/b2c-homev2.module').then((m) => m.B2cHomeV2Module),
  },
  {
  path: 'B2C/product-details/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./B2C/modules/b2c/b2c-product-details/b2c-product-details.component')
      .then(m => m.B2cProductDetailsComponent)
},
  {
    path: 'B2C/search',
    component: B2cSearchComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./B2C/modules/b2c/b2c.module').then((m) => m.B2CModule),
  },
  {
    path: 'B2C/cart',
    component: B2cCartComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./B2C/modules/b2c/b2c.module').then((m) => m.B2CModule),
  },
  {
    path: 'B2C/checkout',
    component: B2cCheckoutComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./B2C/modules/b2c/b2c.module').then((m) => m.B2CModule),
  },
  {
    path: 'B2C/wishlist',
    component: B2cWishlistComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./B2C/modules/b2c/b2c.module').then((m) => m.B2CModule),
  },
//   {
//   path: 'B2C/product-details/:id',
//   canActivate: [authGuard],
//   loadComponent: () =>
//     import(
//       './B2C/modules/b2c/b2c-product-details/b2c-product-details.component'
//     ).then((m) => m.B2cProductDetailsComponent)
// },
  {
    path: 'B2C/login',
    component: B2cLoginComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./B2C/modules/b2c/b2c.module').then((m) => m.B2CModule),
  },
  {
    path: 'B2B/bill',
    component: BillingComponent,
  },
  {
    path: 'B2B',
    component: HomeComponent, // B2B Home Component
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./modules/users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'sidebar',
    loadChildren: () =>
      import('./layout/sidebar/sidebar.module').then((m) => m.SidebarModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'admin-dashboard',
    loadChildren: () =>
      import('./dashboard/admin-dashboard/admin-dashboard.module').then(
        (m) => m.AdminDashboardRoutingModule
      ),
  },
  {
    path: 'cutomer-dashboard',
    loadChildren: () =>
      import('./dashboard/cutomer-dashboard/cutomer-dashboard.module').then(
        (m) => m.CutomerDashboardModule
      ),
  },
  {
    path: 'business-dashboard',
    loadChildren: () =>
      import('./dashboard/business-dashboard/business-dashboard.module').then(
        (m) => m.BusinessDashboardModule
      ),
  },
  {
    path: 'merchant-dashboard',
    loadChildren: () =>
      import('./dashboard/merchant-dashboard/merchant-dashboard.module').then(
        (m) => m.MerchantDashboardModule
      ),
  },
  {
    path: 'sub-home',
    loadChildren: () =>
      import('./modules/home/sub-home/sub-home.module').then(
        (m) => m.SubHomeModule
      ),
  },
  {
    path: 'B2B/cart',
    loadChildren: () =>
      import('./modules/cart/cart.module').then((m) => m.CartModule),
  },
  {
    path: 'B2B/search',
    component: SearchComponent,
    loadChildren: () =>
      import('./modules/search/search.module').then((m) => m.SearchModule),
  },
  {
    path: 'garage',
    loadChildren: () =>
      import('./modules/garage/garage.module').then((m) => m.GarageModule),
  },
  {
    path: 'category',
    loadChildren: () =>
      import('./modules/category/category.module').then(
        (m) => m.CategoryModule
      ),
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./layout/footer/privacy-policy/privacy-policy.module').then(
        (m) => m.PrivacyPolicyModule
      ),
  },
  {
    path: 'B2B/product-details/:id',
    loadChildren: () =>
      import('./modules/product-details/product-details.module').then(
        (m) => m.ProductDetailsModule
      ),
  },
  // {
  //   path: 'B2C/product-details/:id',
  //   loadChildren: () =>
  //     import('./B2C/modules/b2c/b2c-product-details/b2c-product-details.module').then(
  //       (m) => m.B2cProductDetailsModule
  //     ),
  // },
  {
    path: 'wishlist',
    loadChildren: () =>
      import('./modules/wishlist/wishlist.module').then(
        (m) => m.WishlistModule
      ),
  },
];
