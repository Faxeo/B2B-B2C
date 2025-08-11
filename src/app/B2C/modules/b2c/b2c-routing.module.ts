import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { B2CHomeComponent } from './b2c-home/b2c-home.component';
import { B2cSearchComponent } from './b2c-search/b2c-search.component';


const routes: Routes = [
  {
    path: '',
    component: B2CHomeComponent,
    children: [
      {
        path: 'search',
        loadComponent: () =>
          import('./b2c-search/b2c-search.component').then(
            (m) => m.B2cSearchComponent
          ), // Correct standalone component loading
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2CRoutingModule {}
